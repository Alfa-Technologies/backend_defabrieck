# Custom Claims de Firebase (roles de Postgres → token)

**Fecha:** 2026-07-15
**Repo:** `svs-os-defabrieck` (backend NestJS)
**Depende de:** `2026-07-15-crear-usuario-poliglota-design.md` y
`2026-07-15-login-firebase-auth-design.md`.

## Objetivo

Espejar los roles de Postgres (fuente de verdad) al idToken de Firebase como
custom claim `roles`, para que las Reglas de Seguridad de Firestore autoricen
lecturas/escrituras sin consultar Postgres.

**Alcance:** solo backend. No se toca el frontend en este cambio.

## Decisiones acordadas

1. **update():** re-sincronizar claims **solo si `roles` viene en el input**
   (`updateUserInput.roles !== undefined`). Evita llamadas innecesarias a Firebase.
2. **create():** si `setCustomUserClaims` falla, **rollback completo** (va dentro
   del `try` existente → dispara `rollbackFirebaseUser`). O todo o nada.
3. **Backfill:** ejecución **secuencial** con conteo de éxitos y fallos; continúa
   aunque alguno falle.
4. **Retorno del backfill:** ObjectType `SyncClaimsResult { total, synced, failed }`.
5. **Propagación al cliente:** documentada (getIdToken(true)); no se implementa en
   frontend ahora.

## Sección 1 — Helper en `FirebaseService`

Añadir, junto a `getAuth()` / `getUsersCollectionRef()`:

```typescript
import { ValidRoles } from '../../iam/auth/enums/valid-roles.enum';

async setUserRolesClaim(uid: string, roles: ValidRoles[]): Promise<void> {
  await this.getAuth().setCustomUserClaims(uid, { roles });
}
```

(Verificar en implementación que el import de `ValidRoles` no genere ciclo; si lo
hubiera, tipar `roles: string[]` en el helper y pasar el arreglo desde el service.)

## Sección 2 — `create()` (inyección automática)

Dentro del `try` existente, **después** del `set` de Firestore (`firestoreCreated = true`)
y **antes** de crear en Postgres:

```typescript
await this.firebaseService.setUserRolesClaim(uid, roles);
```

Ubicación temprana → si Firebase rechaza el claim, falla antes de escribir Postgres.
El fallo cae en el `catch` existente → `rollbackFirebaseUser(uid, firestoreCreated)`
borra el doc de Firestore y hace `deleteUser(uid)` (que también elimina sus claims).
**El rollback no cambia**; solo se ejecuta una llamada adicional dentro del try.

## Sección 3 — `update()` (re-sincronización condicional)

Estado actual: destructura `{ id, password, isActive, ...toUpdate }`, hace `preload`
(reconstruye `user` con su `firebaseUid` de BD) y `save`.

Cambios:
1. Antes del destructuring, capturar si `roles` viene: `const rolesProvided =
   updateUserInput.roles !== undefined;`.
2. Tras el `save` exitoso en Postgres, si `rolesProvided && user.firebaseUid`:
   ```typescript
   try {
     await this.firebaseService.setUserRolesClaim(user.firebaseUid, user.roles);
   } catch (claimError) {
     this.logger.error(
       `Usuario ${id} actualizado en PG pero falló la sync de claims`,
       claimError,
     );
     throw new InternalServerErrorException(
       'El usuario se actualizó pero no se pudieron sincronizar sus permisos en Firebase. Reintente la sincronización.',
     );
   }
   ```
3. No se revierte Postgres: el rol correcto ya está en la fuente de verdad; solo el
   claim quedó pendiente (resoluble con el backfill).

`roles` ya está incluido en `toUpdate` (no se excluye), así que `preload` lo aplica
antes de leer `user.roles`.

## Sección 4 — Mutación `syncAllFirebaseClaims` (backfill)

Nuevo ObjectType (`src/iam/users/types/sync-claims-result.type.ts` o similar):
```typescript
@ObjectType()
export class SyncClaimsResult {
  @Field(() => Int) total: number;
  @Field(() => Int) synced: number;
  @Field(() => Int) failed: number;
}
```

Método en `UsersService`:
```typescript
async syncAllFirebaseClaims(): Promise<SyncClaimsResult> {
  const users = await this.userRepository.find({
    where: { isActive: true, firebaseUid: Not(IsNull()) },
  });
  let synced = 0;
  let failed = 0;
  for (const user of users) {
    try {
      await this.firebaseService.setUserRolesClaim(user.firebaseUid!, user.roles);
      synced++;
    } catch (error) {
      failed++;
      this.logger.error(`Fallo al sincronizar claims de ${user.id}`, error);
    }
  }
  return { total: users.length, synced, failed };
}
```
(Imports TypeORM: `Not`, `IsNull`.)

Mutación en `UsersResolver`, protegida como `createUser`:
```typescript
@Mutation(() => SyncClaimsResult, { name: 'syncAllFirebaseClaims' })
async syncAllFirebaseClaims(
  @CurrentUser([ValidRoles.superUser, ValidRoles.admin]) user: User,
): Promise<SyncClaimsResult> {
  return this.usersService.syncAllFirebaseClaims();
}
```

**Schema.gql:** aparece `type SyncClaimsResult` y `syncAllFirebaseClaims: SyncClaimsResult!`.
Se regenera al arrancar Nest.

## Sección 5 — Ejemplo de Reglas de Firestore (referencia)

No se aplican reglas reales en este cambio; queda como referencia para cuando se
actualicen las reglas del proyecto `defabrieck-as`.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function hasRole(role) {
      return request.auth != null
        && request.auth.token.roles != null
        && role in request.auth.token.roles;
    }

    // Ejemplo: cotizaciones legibles por admin o calidad, escribibles solo por admin
    match /quotes/{docId} {
      allow read:  if hasRole('admin') || hasRole('quality');
      allow write: if hasRole('admin');
    }
  }
}
```

Los valores de rol coinciden con el enum `ValidRoles` (p. ej. `admin`, `quality`,
`finance`, `superUser`).

## Propagación al cliente (nota, no se implementa)

Los custom claims solo aparecen en el idToken **tras refrescarlo**. Después de un
cambio de rol (update o backfill), el cliente debe forzar el refresco:
`await auth.currentUser.getIdToken(true)`. En sesiones normales, el SDK refresca el
token ~cada hora, por lo que los nuevos roles se propagan como máximo en ese lapso.

## Testing / verificación

- `tsc` / `nest build` limpios.
- create(): usuario nuevo obtiene claim `roles` = su arreglo; si `setCustomUserClaims`
  falla, rollback completo (no queda usuario en Auth/Firestore/PG).
- update(): con `roles` en el input → claim actualizado; sin `roles` → no se llama a
  Firebase; usuario sin `firebaseUid` → no se llama.
- syncAllFirebaseClaims: solo procesa activos con `firebaseUid`; retorna
  `{ total, synced, failed }`; continúa ante fallos individuales; protegida por rol.
- Verificación real de claims (inspeccionar idToken / reglas) queda a cargo del usuario.

## Fuera de alcance

- Cambios en el frontend (refresco de token, UI del backfill).
- Aplicar/desplegar las Reglas de Firestore reales.
- Claims distintos de `roles` (p. ej. companyId).

# Coherencia de sincronización al editar usuario (App AS)

**Fecha:** 2026-07-15
**Repos:** `svs-os-defabrieck` (backend) · `defabrieck-as` (frontend App AS)
**Depende de:** specs de creación políglota, login Firebase, custom claims y
cambio de contraseña admin (2026-07-15).

## Objetivo

Que editar un usuario mantenga Firebase (Auth + Firestore `users/{uid}`) sincronizado
con Postgres en TODOS los campos relevantes, no solo roles y contraseña. Hoy el email
y el displayName (al cambiar vínculo) solo se guardan en Postgres, y el `isActive` de
`changeUserStatus` no llega a Firestore.

## Problema actual (huecos de coherencia)

- **Email:** editable en el modal, se guarda en Postgres pero NO en Firebase Auth ni
  en el doc Firestore → el usuario seguiría con email viejo para login.
- **displayName/vínculo:** al cambiar el empleado/contacto, el `displayName` en Auth y
  en Firestore `users/{uid}` queda desactualizado.
- **isActive:** `changeUserStatus` actualiza Postgres pero no el doc Firestore ni el
  estado `disabled` de la cuenta en Auth.

## Decisiones acordadas

1. **Email:** se **bloquea (read-only)** en el modal de EDICIÓN (en crear sigue
   editable). No se sincroniza porque no cambia. Evita el problema de raíz.
2. **displayName:** recalcular y sincronizar **solo si cambia el vínculo**
   (`employeeId` o `companyContactId` presentes en el input).
3. **Firestore doc:** helper `updateUserDoc(uid, partial)` con `{ merge: true }`.
4. **isActive:** `changeUserStatus` sincroniza `users/{uid}.isActive` en Firestore Y
   deshabilita/habilita la cuenta en Auth (`disabled: !isActive`) para bloquear el
   login de usuarios desactivados.
5. **Fallo de sync:** loguear + `InternalServerErrorException` (Postgres es la fuente
   de verdad; se reporta la desincronización). Consistente con el manejo de roles.
6. Todas las sincronizaciones van **después** del save de Postgres.

## Sección 1 — `FirebaseService`: helper `updateUserDoc`

```typescript
async updateUserDoc(uid: string, data: Record<string, unknown>): Promise<void> {
  await this.getUsersCollectionRef().doc(uid).set(data, { merge: true });
}
```
Merge para actualizar solo los campos cambiados sin pisar el resto del doc.

## Sección 2 — `update()`: displayName al cambiar vínculo

Tras el save de Postgres (junto a los bloques de contraseña y roles ya existentes):

```typescript
const vinculoChanged =
  updateUserInput.employeeId !== undefined ||
  updateUserInput.companyContactId !== undefined;

if (vinculoChanged && savedUser.firebaseUid) {
  // Resolver el nuevo displayName según el vínculo vigente en savedUser.
  let displayName: string | undefined;
  if (savedUser.employeeId) {
    const emp = await this.employeeRepository.findOne({ where: { id: savedUser.employeeId } });
    if (emp) displayName = `${emp.firstName} ${emp.lastName}`.trim();
  } else if (savedUser.companyContactId) {
    const con = await this.contactRepository.findOne({ where: { id: savedUser.companyContactId } });
    if (con) displayName = `${con.firstName} ${con.lastName}`.trim();
  }

  if (displayName) {
    try {
      await this.firebaseService.getAuth().updateUser(savedUser.firebaseUid, { displayName });
      await this.firebaseService.updateUserDoc(savedUser.firebaseUid, { displayName });
    } catch (err) {
      this.logger.error(`Fallo al sincronizar displayName del usuario ${id}`, err);
      throw new InternalServerErrorException(
        'El usuario se actualizó pero no se pudo sincronizar el nombre en Firebase. Reintente.',
      );
    }
  }
}
```

**Desvinculación (ambos null):** si el vínculo se elimina, `displayName` no tiene
fuente clara; en ese caso NO se toca el displayName de Firebase (se deja el anterior).

## Sección 3 — `remove()` (changeUserStatus): isActive → Firestore + Auth disabled

Tras guardar `isActive` en Postgres:
```typescript
if (savedUser.firebaseUid) {
  try {
    await this.firebaseService.getAuth().updateUser(savedUser.firebaseUid, { disabled: !isActive });
    await this.firebaseService.updateUserDoc(savedUser.firebaseUid, { isActive });
  } catch (err) {
    this.logger.error(`Fallo al sincronizar isActive del usuario ${id}`, err);
    throw new InternalServerErrorException(
      'El estado se actualizó en la base pero no se pudo sincronizar en Firebase. Reintente.',
    );
  }
}
```
`remove()` pasa a capturar el resultado del save en una variable (`savedUser`) para
tener el `firebaseUid`.

## Sección 4 — Frontend: email read-only en editar

En `components/users/user-workspace.tsx`, panel de EDICIÓN (no el de crear):
- El input "Correo electrónico" pasa a `disabled` con estilo de bloqueado (visible pero
  no editable).
- `handleSaveEdit` deja de incluir `email` en el payload (o lo deja; el backend no lo
  usa para Firebase). Se prefiere no enviarlo para dejar claro que no cambia.

El panel de CREAR no se toca (email editable ahí).

## Testing / verificación

- `tsc` / `nest build` limpios.
- Cambiar vínculo (empleado→otro) → displayName nuevo en Auth y en Firestore users/{uid}.
- Desactivar usuario → users/{uid}.isActive=false en Firestore y cuenta disabled en Auth
  (el usuario ya no puede iniciar sesión). Reactivar → revierte.
- Editar roles → claim actualizado (comportamiento actual, intacto).
- Email en editar → deshabilitado en la UI; no se desincroniza.
- Fallo de sync → InternalServerErrorException con mensaje claro; Postgres ya guardado.

## Fuera de alcance

- Replicar este flujo en OS (se hará después, cuando el usuario lo indique).
- Permitir cambiar el email (se bloquea, no se sincroniza).
- Cambios en create() (ya sincroniza displayName/isActive/roles al crear).

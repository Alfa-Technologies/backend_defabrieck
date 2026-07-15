# Crear usuario administrativo — Arquitectura políglota (Firebase Auth + Firestore + Postgres)

**Fecha:** 2026-07-15
**Repos:** `svs-os-defabrieck` (backend NestJS) · `defabrieck-as` (frontend App AS)

## Objetivo

Extender el flujo de creación de usuario administrativo para que Firebase sea la
fuente de verdad de la identidad (Auth) y del acceso (Firestore), mientras Postgres
mantiene la lógica relacional del negocio.

- **Firebase Auth (proyecto `asistentes-df`, app default):** fuente de verdad del login.
- **Firestore `users/{uid}` (mismo proyecto):** perfil que la App AS lee al iniciar sesión.
- **Postgres tabla `users`:** relación de negocio (empleado/contacto) + `firebaseUid`.

## Contexto / hallazgos

- `UsersService.create(createUserInput, adminUser)` ya existe y realiza toda la lógica
  relacional de Postgres, incluyendo el enlace `userId` en `Employee` / `CompanyContact`
  y las validaciones `NotFound` / `Conflict`. **No toca Firebase todavía.**
- La entidad `User` ya tiene la columna `firebaseUid` (text, unique, nullable) y `password`
  ya es nullable.
- `CreateUserInput` ya recibe `email`, `password`, `roles`, `employeeId?`, `companyContactId?`.
- `UsersResolver.createUser` ya está expuesto y conectado al servicio.
- `FirebaseService` es `@Global()`, inicializa la app default con `asistentes-df`
  (`firebase-service-account.json`) y expone Firestore, pero **no** expone `admin.auth()`
  ni la colección raíz `users`. El `ADMIN_APP` (`defabrieck-as`) es para quotes y **no** se
  usa en este flujo.
- **Frontend ya construido:** `components/users/user-workspace.tsx` tiene el wizard de 4 pasos,
  la mutación `CREATE_USER`, estado con `useState`, spinner (`creating`), `notify.success/error`,
  reset del formulario, `refetch`, y envía `employeeId`/`companyContactId` correctamente.

### Decisiones de diseño (acordadas)

1. **Firebase Auth es la fuente de verdad** del login. En `create()` ya **no** se hace
   `bcrypt.hashSync` ni se guarda `password` en Postgres (columna queda NULL). El password
   solo va a Firebase Auth. `update()` conserva su bcrypt sin cambios.
2. **Firestore `users/{uid}`** guarda el arreglo de roles tal cual (`ValidRoles`), más
   `email`, `displayName`, `isActive: true`.
3. **Orden:** Auth → Firestore → Postgres. Rollback granular con banderas.

## Configuración / entorno

- En local no se requieren variables nuevas: `FirebaseService` cae al archivo
  `firebase-service-account.json` (ya presente, `project_id: asistentes-df`).
- En producción se define `FIREBASE_SERVICE_ACCOUNT` con el JSON completo como string
  (mecanismo ya existente en `loadServiceAccount`). No se añade nada al `.env` para este flujo.

## Sección 2 — `FirebaseService`

Añadir dos accesos mínimos, sin modificar lo existente. `admin.auth()` (sin nombre de app)
y `this.firestore` usan la app default (`asistentes-df`).

```typescript
getAuth(): admin.auth.Auth {
  return admin.auth();
}

getUsersCollectionRef(): admin.firestore.CollectionReference {
  return this.firestore.collection('users');
}
```

## Sección 3 — `UsersService.create()` reescrito

Firma sin cambios: `create(createUserInput: CreateUserInput, adminUser: User): Promise<User>`.
Inyectar `FirebaseService` en el constructor (módulo `@Global()`, inyección directa).

### Flujo

1. **Validación (fuera del try de rollback):**
   - Rechazar si vienen `employeeId` **y** `companyContactId` a la vez → `BadRequestException`.
   - Rechazar si **no** viene ninguno → `BadRequestException` ("Debe indicar un empleado o un contacto.").
   - Resolver `displayName`:
     - Si `employeeId`: buscar `Employee`; si no existe → `NotFoundException`; si ya tiene
       `userId` → `ConflictException`. `displayName = firstName + ' ' + lastName`.
     - Si `companyContactId`: idem con `CompanyContact`.
2. **Firebase Auth:** `getAuth().createUser({ email, password, displayName })` → `uid`.
3. **Firestore:** `getUsersCollectionRef().doc(uid).set({ email, displayName, isActive: true, roles })`.
   Marcar bandera `firestoreCreated = true`.
4. **Postgres:** crear `User` con `email`, `roles` (default `[ValidRoles.user]` si vacío),
   `firebaseUid: uid`, `employeeId`/`companyContactId`, `createdBy`/`lastUpdateBy = adminUser.id`.
   **Sin `password`.** Guardar. Luego `employeeRepository.update` / `contactRepository.update`
   para enlazar `userId` (lógica existente).
5. **Retornar** `findOneById(savedUser.id)`.

### Rollback

- Validaciones del paso 1 se relanzan tal cual (no hay nada creado en Firebase).
- A partir del paso 2, todo va en un `try`. En el `catch`:
  - Si `firestoreCreated`: `getUsersCollectionRef().doc(uid).delete()`.
  - Si `uid` existe: `getAuth().deleteUser(uid)`.
  - Loguear el error original.
  - Si el error es una `HttpException` de negocio conocida (p. ej. `23505` traducido a
    `ConflictException` de email duplicado), relanzarlo; en cualquier otro caso lanzar
    `InternalServerErrorException` con mensaje claro.
- La limpieza de rollback se envuelve en su propio try/catch para que un fallo al limpiar
  no oculte el error original.

## Sección 4 — Ajustes frontend (`user-workspace.tsx`)

1. **Vínculo obligatorio:** incluir `!newLinkId` en el guard de `handleCreate` y en el
   `disabled` del botón "Crear usuario", para no depender de un error del servidor.
2. **Propagar error real:** en el `catch` de `handleCreate`, extraer
   `err.graphQLErrors?.[0]?.message` (fallback a mensaje genérico) y mostrarlo con `notify.error`.

Sin cambios en spinner, reset, `refetch`, toast de éxito ni en el envío de
`employeeId`/`companyContactId`. Se respeta el patrón `FullScreenPanel` (cerrar + refetch)
en lugar de una redirección.

## Testing / verificación

- Backend compila (`tsc` / build sin errores nuevos).
- Caso feliz (empleado): crea Auth + doc Firestore + registro PG con `firebaseUid`, enlaza `userId`.
- Caso feliz (contacto): idem con `CompanyContact`.
- Validación: sin ningún ID → `BadRequestException`; ambos IDs → `BadRequestException`.
- Rollback: forzar fallo de PG (email duplicado) tras Auth → verificar que se borran doc
  Firestore y usuario de Auth; no quedan cuentas huérfanas.
- Frontend: botón deshabilitado sin vínculo; error de "correo ya existe" se muestra en toast.

## Fuera de alcance

- No se modifica `update()` ni el login.
- No se toca `ADMIN_APP` ni el flujo de quotes.
- No se añade redirección en el frontend (se mantiene el panel).

# Cambio de contraseña por admin (Firebase Admin)

**Fecha:** 2026-07-15
**Repos:** `svs-os-defabrieck` (backend NestJS) · `defabrieck-as` (frontend App AS)
**Depende de:** specs de creación políglota, login Firebase y custom claims (2026-07-15).

## Objetivo

Conectar el campo "Nueva contraseña" del panel de edición de usuario (hoy un
no-op) a Firebase Auth, donde ahora viven las contraseñas. Flujo **exclusivamente
administrativo**: un admin resetea la contraseña de otro usuario.

## Problema actual

`handleSaveEdit` (frontend) envía `password` dentro de `updateUserInput` cuando el
admin escribe una contraseña nueva. El `update()` del backend **descarta** ese
`password` (`const { id, password: __, isActive, ...toUpdate }`). Resultado: la UI
reporta éxito pero la contraseña nunca cambia. Cambio silencioso y engañoso.

## Decisiones acordadas

1. **Extender `update()`** (no crear mutación separada): el front ya manda `password`
   en ese payload y `update()` ya tiene el `firebaseUid` cargado por `preload`.
2. **Fail-fast:** si el input trae `password` pero el usuario no tiene `firebaseUid`,
   lanzar `BadRequestException` **antes** del save de Postgres (atomicidad).
3. **Validación mínimo 8:** heredada del DTO (`UpdateUserInput extends
   PartialType(CreateUserInput)`), aplica solo si el campo viene. No se toca el DTO.
4. **Sin contraseña anterior:** `admin.auth().updateUser` no la requiere (operación
   de admin). La mutación `updateUser` ya está protegida por
   `@CurrentUser([superUser, admin])`.

## Sección 1 — Backend `update()`

En `src/iam/users/users.service.ts`:

1. Dejar de descartar el password: cambiar `password: __` por `password` en el
   destructuring para usarlo.
2. **Fail-fast (antes del save):** si `password !== undefined`:
   - Cargar/confirmar el `firebaseUid` del usuario. Como `preload` reconstruye el
     `user` con el `firebaseUid` de BD, se valida sobre ese valor. Si el usuario no
     tiene `firebaseUid` →
     `throw new BadRequestException('Este usuario no tiene una cuenta de Firebase asociada; no se puede cambiar la contraseña.')`.
3. Guardar en Postgres (roles/email/relación) como hoy.
4. Tras el save, junto al bloque de sync de claims ya existente, si `password`:
   ```typescript
   try {
     await this.firebaseService
       .getAuth()
       .updateUser(savedUser.firebaseUid!, { password });
   } catch (pwError) {
     this.logger.error(`Fallo al cambiar la contraseña del usuario ${id}`, pwError);
     throw new InternalServerErrorException(
       'El usuario se actualizó pero no se pudo cambiar la contraseña. Reintente.',
     );
   }
   ```

Nota de orden: la validación de `firebaseUid` (paso 2) ocurre antes del save para no
dejar Postgres actualizado con la contraseña sin cambiar. El cambio real en Firebase
(paso 4) va tras el save, consistente con el bloque de claims.

## Sección 2 — Frontend (`user-workspace.tsx`)

- El campo "Nueva contraseña" (placeholder "Dejar en blanco para no cambiar") ya
  existe y `handleSaveEdit` ya envía `password` solo cuando tiene valor. **No se
  toca esa lógica.**
- Mejora: en el `catch` de `handleSaveEdit`, propagar el mensaje real del backend
  (`err.graphQLErrors?.[0]?.message`, fallback al genérico) — igual que en
  `handleCreate` — para que el admin vea el motivo si el cambio de contraseña falla.

## Sección 3 — Seguridad

- `admin.auth().updateUser(uid, { password })` es una operación privilegiada que no
  requiere la contraseña anterior. Correcto para reseteo administrativo.
- Solo `superUser`/`admin` pueden invocar `updateUser` (guard + decorador ya existentes).
- No se implementa self-service (el usuario cambiando su propia contraseña); sería
  una pantalla distinta con el Client SDK (`updatePassword`), fuera de alcance.

## Testing / verificación

- `tsc` / `nest build` limpios.
- Editar usuario con nueva contraseña válida → cambia en Firebase; el usuario entra
  con la nueva.
- Nueva contraseña < 8 caracteres → rechazada por validación heredada, mensaje claro.
- `password` presente + usuario sin `firebaseUid` → `BadRequestException`, sin tocar PG.
- Editar sin contraseña → no se llama a Firebase; comportamiento actual intacto.
- Frontend: error real del backend visible en el toast.

## Fuera de alcance

- Self-service de cambio de contraseña (Client SDK).
- Reset por email de Firebase.
- Cambios en el DTO (la validación mínima 8 ya se hereda).

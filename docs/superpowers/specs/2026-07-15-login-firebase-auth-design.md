# Migrar Login a Firebase Auth (Firebase como IdP)

**Fecha:** 2026-07-15
**Repos:** `svs-os-defabrieck` (backend NestJS) · `defabrieck-as` (frontend App AS)
**Depende de:** `2026-07-15-crear-usuario-poliglota-design.md` (users creados en Firebase Auth `asistentes-df` con `firebaseUid` en Postgres).

## Objetivo

Delegar la autenticación por completo a Firebase Auth y eliminar la validación de
contraseñas en Postgres, hasta poder borrar la columna `password` de `User`.

- **Firebase Auth (`asistentes-df`)** = IdP. NestJS deja de emitir/validar JWT propios.
- **Backend:** guard verifica idToken con `admin.auth().verifyIdToken()` y resuelve el
  `User` de Postgres por `firebaseUid`.
- **Frontend:** login con `signInWithEmailAndPassword`; Apollo pide idToken fresco a
  Firebase en cada request (auto-refresh).

## Decisiones acordadas

1. **Usuarios legacy:** el guard busca `User` solo por `firebaseUid` (sin fallback por email).
   Se asume que todos los usuarios están migrados a Firebase Auth.
2. **Refresh:** el `authLink` de Apollo llama `auth.currentUser.getIdToken()` (async) en
   cada request; el SDK refresca si expiró (~1h).
3. **Front — dos apps Firebase:** nueva instancia solo para Auth (`asistentes-df`); la
   actual (`defabrieck-as`) se mantiene para Firestore de datos. No se tocan los ~25 hooks.
4. **AuthModule:** se conserva reducido (solo provee/exporta el guard reescrito).
5. **Deps huérfanas:** quitar `passport`, `passport-jwt`, `@nestjs/jwt`, `@nestjs/passport`,
   `bcrypt` del backend tras verificar por grep que nada más las use.
6. **Roles en el front:** query GraphQL `me` (protegida por el guard) como fuente única de
   verdad; el front la llama tras `signIn` y en `onAuthStateChanged` al recargar.
7. **`tokenReady`:** derivado de `onAuthStateChanged` (sesión Firebase resuelta).

## Hallazgos relevantes

- `JwtAuthGuard` se usa en **60 lugares / 19 resolvers** vía `@UseGuards(JwtAuthGuard)`.
  Se reescribe **manteniendo el nombre**; ningún resolver cambia.
- `CurrentUser` decorator lee `req.user` y hace el chequeo de roles + `isActive`. Se
  preserva intacto: el guard debe seguir poniendo la entidad `User` de Postgres en `req.user`.
- No existe `middleware.ts` en el front (los comentarios lo mencionan como aspiración). El
  gating real es por estado de auth en cliente. La cookie `defabrieck-auth-token` se
  conserva por compatibilidad pero no es la fuente de gating.
- El front ya usa Firebase (Firestore) intensamente contra `defabrieck-as`.
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` del front = `defabrieck-as` (datos). Auth irá a `asistentes-df`.

---

## PARTE 1 — BACKEND

### Sección 1 — `JwtAuthGuard` reescrito (verificación Firebase)

Reemplazar el interior de `src/iam/auth/guards/jwt-auth.guard.ts`. Deja de extender
`AuthGuard('jwt')`; pasa a `implements CanActivate`, inyectable (`FirebaseService`,
`UsersService`).

Flujo de `canActivate`:
1. `ctx = GqlExecutionContext.create(context); req = ctx.getContext().req`.
2. Extraer `Authorization: Bearer <token>`; si falta → `UnauthorizedException`.
3. `decoded = await firebaseService.getAuth().verifyIdToken(token)`; si falla → `UnauthorizedException`.
4. `user = await usersService.findOneByFirebaseUid(decoded.uid)`; si no existe → `UnauthorizedException`.
5. Si `!user.isActive` → `UnauthorizedException` (mensaje de cuenta desactivada).
6. `req.user = user; return true`.

Nuevo método en `UsersService`:
```typescript
async findOneByFirebaseUid(firebaseUid: string): Promise<User> {
  return this.userRepository.findOneOrFail({ where: { firebaseUid } });
}
```
(lanza si no existe; el guard traduce a `UnauthorizedException`).

`@CurrentUser([roles])` no cambia: sigue leyendo `req.user` con `roles` e `isActive`.

### Sección 2 — Query `me` + limpieza de código muerto

**Añadir** query `me` (reemplazo de `revalite`), protegida por `JwtAuthGuard`, que devuelve
`@CurrentUser() user: User`. Vive en `AuthResolver` (o `UsersResolver`); se decide en impl,
preferencia `AuthResolver` para mantener cohesión de auth.

**Eliminar:**
- `AuthResolver`: mutación `login` y query `revalite`.
- `AuthService`: `login`, `validateUser`, `revalidateToken`, `getJwtToken`; imports de
  `bcrypt` y `JwtService`. Si queda vacío, se elimina el service.
- Archivos: `strategies/jwt.strategy.ts`, `dto/inputs/login.input.ts`,
  `types/auth-response.type.ts`, `interfaces/jwt-payload.interface.ts`.
- `AuthModule`: quitar `PassportModule`, `JwtModule`, `JwtStrategy`. Debe importar
  `UsersModule`, y proveer/exportar `JwtAuthGuard`. (FirebaseModule es `@Global`.)
- Deps del `package.json`: `passport`, `passport-jwt`, `@types/passport-jwt`,
  `@nestjs/jwt`, `@nestjs/passport`, `bcrypt`, `@types/bcrypt` — quitar tras grep de
  verificación de que nada más las usa; reinstalar.
- `.env`: `JWT_SECRET` queda sin uso (se puede dejar comentado).

**Nota schema.gql:** se regenera; desaparecen `login`, `revalite`, `LoginInput`,
`AuthResponse`; aparece `me: User!`.

### Sección 3 — Entidad `User` y columna `password`

- `user.entity.ts`: quitar columna `password`, import de `bcrypt`, método `checkPassword()`.
- `UsersService.update()`: quitar el bloque `if (password) { bcrypt.hashSync }` y su
  desestructuración; quitar `password` de `UpdateUserInput` si existe.
- **Migración BD (Supabase):** `ALTER TABLE users DROP COLUMN password;`. Documentada, no se
  ejecuta contra la BD real en este cambio. Como la columna ya es nullable, quitarla del
  entity no rompe inserts existentes.

---

## PARTE 2 — FRONTEND (`defabrieck-as`)

### Sección 4 — Segunda app Firebase para Auth

Nuevo `lib/firebase/auth-app.ts`:
```typescript
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const authConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_AUTH_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_AUTH_PROJECT_ID, // asistentes-df
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_AUTH_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_AUTH_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_AUTH_APP_ID,
};

const AUTH_APP_NAME = "auth";
const authApp =
  getApps().find((a) => a.name === AUTH_APP_NAME) ??
  initializeApp(authConfig, AUTH_APP_NAME);

export const auth = getAuth(authApp);
```
La app actual (`firebase.ts` → `defabrieck-as`) queda intacta para Firestore de datos.

**Envs nuevas a definir por el usuario** (credenciales web de `asistentes-df`):
`NEXT_PUBLIC_FIREBASE_AUTH_API_KEY`, `_AUTH_DOMAIN`, `_PROJECT_ID`, `_STORAGE_BUCKET`,
`_MESSAGING_SENDER_ID`, `_APP_ID`.

### Sección 5 — Login con Firebase + carga del `user`

`components/auth/login-form.tsx`:
- Eliminar `LOGIN_MUTATION` y `useMutation`.
- `handleSubmit`:
  ```typescript
  await signInWithEmailAndPassword(auth, email.trim(), password);
  // onAuthStateChanged (Sección 6) dispara la carga de `me` y setAuth.
  router.replace("/");
  ```
- Errores de Firebase (`auth/invalid-credential`, etc.) → mensaje genérico
  "Credenciales incorrectas." (sin enumeración de usuarios).

Query `me` en el front (`lib/auth/use-me.ts` o dentro del provider): devuelve `id, email,
roles, isActive, employee { ... }, companyContact { ... }` — mismos campos que hoy consume
`AuthUser` en `store.ts`. Se llama con el idToken de Firebase ya activo.

`store.ts`: `setAuth` deja de requerir el idToken como fuente de sesión. Se guarda solo el
`user` (roles/isActive) para `canAccess`. La sesión la mantiene Firebase (SDK). La cookie se
conserva por compat (opcional, seteada con idToken vigente si algún consumidor la requiere).

### Sección 6 — Apollo token fresco + bootstrap de sesión + logout

`lib/apollo/client.ts` — `authLink` async:
```typescript
import { auth } from "@/lib/firebase/auth-app";

const authLink = setContext(async (_, { headers }) => {
  const token = await auth.currentUser?.getIdToken();
  return { headers: { ...headers, ...(token ? { authorization: `Bearer ${token}` } : {}) } };
});
```

Bootstrap de sesión (en el provider de auth/apollo, con `onAuthStateChanged`):
- Al resolver la sesión: si hay `auth.currentUser` y no hay `user` en store → ejecutar query
  `me` y `setAuth(user)`. Si no hay sesión → `clearAuth()`.
- `tokenReady` (usado en `skip: !tokenReady`): pasa a ser "primer `onAuthStateChanged`
  resuelto con `currentUser != null`". Actualizar `use-auth.ts`/`store.ts` en consecuencia.

Logout: donde hoy se llama `clearAuth()`, añadir `await signOut(auth)` antes.

---

## Testing / verificación

- Backend compila (`tsc`), sin referencias colgantes a `bcrypt`/`passport`/`JwtService`.
- Guard: token Firebase válido → `req.user` es el User de Postgres correcto; token inválido
  o `firebaseUid` inexistente → 401; usuario inactivo → 401.
- `@CurrentUser([roles])` sigue autorizando/denegando por rol igual que antes.
- Query `me` devuelve el user autenticado.
- Front: login con `signInWithEmailAndPassword`; roles cargados vía `me`; recarga de página
  rehidrata sesión y roles; Apollo manda `Authorization: Bearer <idToken fresco>`; logout
  hace `signOut` y limpia estado.
- Verificación end-to-end real (Firebase `asistentes-df` + Supabase) queda a cargo del
  usuario; el asistente valida por typecheck y lectura.

## Fuera de alcance

- Migración/duplicado de colecciones Firestore de datos (siguen en `defabrieck-as`).
- Reset de contraseña / registro self-service (los users los crea un admin).
- Ejecutar la migración `DROP COLUMN password` contra la BD real.
- Custom claims de roles en Firebase (los roles viven en Postgres, expuestos por `me`).

import { Module } from '@nestjs/common';

import { AuthResolver } from './auth.resolver';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersModule } from '../users/users.module';

/**
 * Módulo de autenticación reducido: tras migrar a Firebase Auth como IdP, ya no
 * emitimos ni validamos JWT propios. Solo provee el `JwtAuthGuard` (verificación
 * de idToken de Firebase) y la query `me`. FirebaseModule es `@Global`.
 */
@Module({
  imports: [UsersModule],
  providers: [AuthResolver, JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class AuthModule {}

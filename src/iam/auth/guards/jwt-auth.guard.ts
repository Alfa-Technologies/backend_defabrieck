import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { FirebaseService } from '../../../infrastructure/firebase/firebase.service';
import { UsersService } from '../../users/users.service';

/**
 * Guard de autenticación basado en Firebase Auth.
 *
 * Conserva el nombre `JwtAuthGuard` para no tocar los ~60 `@UseGuards(JwtAuthGuard)`
 * repartidos por los resolvers. Verifica el idToken de Firebase, resuelve el `User`
 * de Postgres por `firebaseUid` y lo inyecta en `req.user`, de modo que el decorador
 * `@CurrentUser([roles])` sigue funcionando sin cambios.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;

    const token = this.extractBearerToken(req);
    if (!token) {
      throw new UnauthorizedException('No se proporcionó un token de acceso.');
    }

    let uid: string;
    try {
      const decoded = await this.firebaseService.getAuth().verifyIdToken(token);
      uid = decoded.uid;
    } catch {
      throw new UnauthorizedException('Token de acceso inválido o expirado.');
    }

    let user;
    try {
      user = await this.usersService.findOneByFirebaseUid(uid);
    } catch {
      throw new UnauthorizedException(
        'No se encontró un usuario asociado a esta cuenta.',
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Su cuenta de usuario está desactivada. Por favor, contacte al administrador del sistema para reactivar su acceso.',
      );
    }

    req.user = user;
    return true;
  }

  private extractBearerToken(req: {
    headers?: Record<string, string | undefined>;
  }): string | null {
    const authHeader = req?.headers?.authorization;
    if (!authHeader) return null;

    const [scheme, token] = authHeader.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) return null;

    return token;
  }
}

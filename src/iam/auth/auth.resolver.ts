import { Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver(() => User)
export class AuthResolver {
  /**
   * Devuelve el usuario autenticado (resuelto desde Firebase Auth por el guard).
   * Reemplaza a la antigua query `revalite`: el front la usa para hidratar roles.
   */
  @Query(() => User, { name: 'me' })
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: User): User {
    return user;
  }
}

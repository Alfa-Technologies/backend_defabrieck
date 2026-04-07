import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { LoginInput } from './dto/inputs/login.input';
import { AuthResponse } from './types/auth-response.type';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginInput: LoginInput): Promise<AuthResponse> {
    const { email, password } = loginInput;
    let user: User;

    try {
      user = await this.usersService.findOneByEmail(email);
    } catch (error) {
      throw new UnauthorizedException('Correo o contraseña incorrectos.');
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Correo o contraseña incorrectos.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Su cuenta de usuario está desactivada. Por favor, contacte al administrador del sistema para reactivar su acceso.',
      );
    }

    const token = this.getJwtToken(user.id);

    return { token, user };
  }

  async validateUser(id: string): Promise<User> {
    const user = await this.usersService.findOneById(id);

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Su cuenta de usuario está desactivada. Por favor, contacte al administrador del sistema para reactivar su acceso.',
      );
    }

    return user;
  }

  revalidateToken(user: User): AuthResponse {
    const token = this.getJwtToken(user.id);
    return { token, user };
  }

  private getJwtToken(userId: string) {
    return this.jwtService.sign({ id: userId });
  }
}

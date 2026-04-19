import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { CredentialsService } from './credentials/credentials.service';
import { errorMsg } from '@/constants';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { RegisterDTO } from './auth.dto';
import { TokenPayload } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly credentialsService: CredentialsService,
    private readonly jwtService: JwtService
  ) { }

  private async validateCredentials(userEmail: string, password: string): Promise<TokenPayload> {
    try {
      const user = await this.userService.findByEmail(userEmail);
      const isRightPassword = await this.credentialsService.validatePassword(
        user.id,
        password
      );

      if (!isRightPassword) throw new UnauthorizedException(errorMsg.INVALID_CREDENTIALS);

      return {
        sub: user.id,
        username: user.name,
        email: user.email,
        role: user.role,
      }
    } catch (error: any) {
      switch (error.statusCode) {
        case 404:
          throw new UnauthorizedException(errorMsg.INVALID_CREDENTIALS);
        default:
          throw error;
      }
    }
  }

  async login(email: string, password: string) {
    const tokenPayload = await this.validateCredentials(email, password);
    const access_token = await this.jwtService.signAsync(tokenPayload);

    return { access_token };
  }

  async register(account: Omit<RegisterDTO, 'userId'>) {
    const { password, ...userData } = account;

    const newUser = await this.userService.create(userData);

    await this.credentialsService.create({
      userId: newUser!.id,
      password
    })

    return newUser;
  }
}

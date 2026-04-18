import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { LoginDTO, LoginResponseDTO, RegisterDTOWithoutId } from './auth.dto';
import { AuthService } from './auth.service';
import { Public } from '@/core/guards/auth/public.decorator';
import { handleException } from '@/utils/exceptionHandler';
import { Roles } from '@/core/guards/rbac/roles.decorator';
import { UserRole } from '../users/user.dto';
import { LoginResponseDocs, RegisterResponseDocs } from './auth-swagger.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Public()
  @LoginResponseDocs()
  async login(@Body() credentials: LoginDTO): Promise<LoginResponseDTO | undefined> {
    const { email, password } = credentials;

    try {
      const result = this.authService.login(email, password);

      return result;
    } catch (error: any) {
      handleException(error);
    }
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN)
  @RegisterResponseDocs()
  async register(@Body() account: RegisterDTOWithoutId) {
    const { name, lastName, email, role, password } = account;

    try {
      const result = await this.authService.register({
        name,
        lastName,
        email,
        role,
        password
      });

      return { user: result };
    } catch (error: any) {
      handleException(error);
    }
  }
}

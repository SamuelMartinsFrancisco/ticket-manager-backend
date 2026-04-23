import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { LoginDTO, LoginResponseDTO, RegisterDTOWithoutId } from './auth.dto';
import { AuthService } from './auth.service';
import { Public } from '@/core/guards/auth/public.decorator';
import { handleException } from '@/utils/exceptionHandler';
import { Roles } from '@/core/guards/rbac/roles.decorator';
import { UserRole } from '../users/user.dto';
import { LoginDocs, RegisterDocs } from './auth-swagger.decorator';
import { ApiSecurity } from '@nestjs/swagger';
import { errorMsg } from '@/constants';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Public()
  @ApiSecurity('')
  @LoginDocs()
  async login(@Body() credentials: LoginDTO) {
    const { email, password } = credentials;

    try {
      const result = await this.authService.login(email, password);

      return result;
    } catch (error: any) {
      if (error.status === 404) {
        throw new UnauthorizedException(errorMsg.INVALID_CREDENTIALS);
      }

      handleException(error, {})
    }
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN)
  @RegisterDocs()
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

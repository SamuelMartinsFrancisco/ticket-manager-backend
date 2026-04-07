import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { LoginDTO, RegisterDTO } from './auth.dto';
import { AuthService } from './auth.service';
import { Public } from '@/core/guards/auth/public.decorator';
import { handleException } from '@/utils/exceptionHandler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() credentials: LoginDTO) {
    const { email, password } = credentials;

    try {
      const result = this.authService.login(email, password);

      return result;
    } catch (error: any) {
      handleException(error);
    }
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(@Body() account: Omit<RegisterDTO, | 'userId'>) {
    const { name, lastName, email, role, password } = account;

    try {
      const result = await this.authService.register({
        name,
        lastName,
        email,
        role,
        password
      });

      return result;
    } catch (error: any) {
      handleException(error);
    }
  }
}

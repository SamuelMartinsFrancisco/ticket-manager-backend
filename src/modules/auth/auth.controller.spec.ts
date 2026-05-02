import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { createFakeUser, createUserRegisterDTO } from '@/utils/test/mocks/auth.mock';
import { errorMsg } from '@/constants';
import { UserRole } from '@/modules/users/user.dto';
import { IS_PUBLIC } from '@/core/guards/auth/public.decorator';
import { ROUTE_REQUIRED_ROLES } from '@/core/guards/rbac/roles.decorator';
import {
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('AuthController', () => {
  const mockLoginDto = { email: 'user@example.com', password: 'Secret123' };
  const mockLoginResponse = { accessToken: 'jwt-token' };
  const mockRegisterDto = createUserRegisterDTO();
  const mockUser = createFakeUser();

  let controller: AuthController;
  let mockAuthService: Record<'login' | 'register', jest.Mock>;

  beforeEach(() => {
    mockAuthService = {
      login: jest.fn(),
      register: jest.fn(),
    };
    controller = new AuthController(mockAuthService as unknown as AuthService);
  });

  describe('login', () => {
    it('should return token on successful login', async () => {
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(mockLoginDto);

      expect(mockAuthService.login).toHaveBeenCalledWith(
        mockLoginDto.email,
        mockLoginDto.password,
      );
      expect(result).toEqual(mockLoginResponse);
    });

    it('should throw UnauthorizedException with INVALID_CREDENTIALS when service throws 404', async () => {
      mockAuthService.login.mockRejectedValue({ status: 404 });

      await expect(controller.login(mockLoginDto)).rejects.toThrow(UnauthorizedException);
      await expect(controller.login(mockLoginDto)).rejects.toThrow(errorMsg.INVALID_CREDENTIALS);
    });

    it('should throw UnauthorizedException with original message when service throws 401', async () => {
      mockAuthService.login.mockRejectedValue({ status: 401, message: 'Wrong password' });

      await expect(controller.login(mockLoginDto)).rejects.toThrow(UnauthorizedException);
      await expect(controller.login(mockLoginDto)).rejects.toThrow('Wrong password');
    });

    it('should throw InternalServerErrorException with UNKNOWN when service throws unexpected error', async () => {
      mockAuthService.login.mockRejectedValue({ status: 500, message: 'DB down' });

      await expect(controller.login(mockLoginDto)).rejects.toThrow(InternalServerErrorException);
      await expect(controller.login(mockLoginDto)).rejects.toThrow(errorMsg.UNKNOWN);
    });
  });

  describe('register', () => {
    it('should return user object on successful registration', async () => {
      mockAuthService.register.mockResolvedValue(mockUser);

      const result = await controller.register(mockRegisterDto);

      expect(mockAuthService.register).toHaveBeenCalledWith({
        name: mockRegisterDto.name,
        lastName: mockRegisterDto.lastName,
        email: mockRegisterDto.email,
        role: mockRegisterDto.role,
        password: mockRegisterDto.password,
      });
      expect(result).toEqual({ user: mockUser });
    });

    it('should throw ConflictException when service throws ConflictException', async () => {
      mockAuthService.register.mockRejectedValue(new ConflictException('Email already exists'));

      await expect(controller.register(mockRegisterDto)).rejects.toThrow(ConflictException);
      await expect(controller.register(mockRegisterDto)).rejects.toThrow('Email already exists');
    });

    it('should throw InternalServerErrorException when service throws BadRequestException', async () => {
      mockAuthService.register.mockRejectedValue(new BadRequestException('validation error'));

      await expect(controller.register(mockRegisterDto)).rejects.toThrow(InternalServerErrorException);
      await expect(controller.register(mockRegisterDto)).rejects.toThrow(errorMsg.UNKNOWN);
    });

    it('should throw InternalServerErrorException when service throws generic error', async () => {
      mockAuthService.register.mockRejectedValue(new Error('Some error'));

      await expect(controller.register(mockRegisterDto)).rejects.toThrow(InternalServerErrorException);
      await expect(controller.register(mockRegisterDto)).rejects.toThrow(errorMsg.UNKNOWN);
    });
  });

  describe('route access control decorators', () => {
    it('login should be public (no auth, no roles required)', () => {
      const metadata = Reflect.getMetadata(IS_PUBLIC, AuthController.prototype.login);
      expect(metadata).toBe(true);
    });

    it('register should require ADMIN role', () => {
      const roles = Reflect.getMetadata(ROUTE_REQUIRED_ROLES, AuthController.prototype.register);
      expect(roles).toEqual([UserRole.ADMIN]);
    });
  });
});
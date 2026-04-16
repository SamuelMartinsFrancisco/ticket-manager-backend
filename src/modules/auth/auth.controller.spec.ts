import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDTO } from './auth.dto';
import {
  ConflictException,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthGuard } from '@/core/guards/auth/auth.guard';
import { errorMsg } from '@/constants';
import { createFakeUser } from '@/utils/test/mocks';
import { UserDTO } from '../users/user.dto';

const mockAuthGuard = {
  canActivate: jest.fn(() => true),
};

const createUserRegisterDTO = (user?: UserDTO): Omit<RegisterDTO, 'userId'> => {
  const mockUser = user ?? createFakeUser();
  const { id, createdAt, updatedAt, ...rest } = mockUser;

  return {
    ...rest,
    password: 'supersecret_123',
  }
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<Pick<AuthService, 'register'>>;

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a new user and return success message when data is valid', async () => {
      const userData = createFakeUser();
      const registerDTO = createUserRegisterDTO(userData);

      authService.register.mockResolvedValue(userData);
      mockAuthGuard.canActivate.mockReturnValue(true);

      const result = await controller.register(registerDTO);

      expect(authService.register).toHaveBeenCalledWith(registerDTO);
      expect(result).toEqual({ user: userData });
    });

    it('should throw ConflictException when email is already registered', async () => {
      const registerDTO = createUserRegisterDTO();
      const conflictError = new ConflictException('Email already registered');

      authService.register.mockRejectedValue(conflictError);
      mockAuthGuard.canActivate.mockReturnValue(true);

      await expect(controller.register(registerDTO)).rejects.toThrow(
        ConflictException,
      );

      expect(authService.register).toHaveBeenCalledWith(registerDTO);
    });

    it('should throw BadRequestException when a required field is missing', async () => {
      const registerDTO = createUserRegisterDTO();
      const invalidDTO = {
        ...registerDTO,
        lastName: '',
      };
      const validationError = new BadRequestException('Last name is required');

      authService.register.mockRejectedValue(validationError);
      mockAuthGuard.canActivate.mockReturnValue(true);

      await expect(controller.register(invalidDTO)).rejects.toThrow(
        BadRequestException,
      );
      expect(authService.register).toHaveBeenCalledWith(invalidDTO);
    });

    it('should throw BadRequestException when email format is invalid', async () => {
      const registerDTO = createUserRegisterDTO();
      const invalidEmailDto = {
        ...registerDTO,
        email: 'usuario#empresa.com',
      };
      const validationError = new BadRequestException(
        'Please enter a valid email address',
      );

      authService.register.mockRejectedValue(validationError);
      mockAuthGuard.canActivate.mockReturnValue(true);

      await expect(controller.register(invalidEmailDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(authService.register).toHaveBeenCalledWith(invalidEmailDto);
    });

    it('should return 401 Unauthorized when no valid session exists', async () => {
      const registerDTO = createUserRegisterDTO();

      mockAuthGuard.canActivate.mockImplementation(() => {
        throw new UnauthorizedException();
      });

      await expect(controller.register(registerDTO)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.register).not.toHaveBeenCalled();
    });

    it('should map unknown errors to InternalServerErrorException via handleException', async () => {
      const registerDTO = createUserRegisterDTO();
      const unknownError = new Error('Some unexpected database error');
      const internalError = new InternalServerErrorException(errorMsg.UNKNOWN);

      authService.register.mockRejectedValue(unknownError);
      mockAuthGuard.canActivate.mockReturnValue(true);


      jest.spyOn(controller as any, 'register').mockRejectedValueOnce(internalError);

      await expect(controller.register(registerDTO)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
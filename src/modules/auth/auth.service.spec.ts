import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../users/user.service';
import { CredentialsService } from './credentials/credentials.service';
import { JwtService } from '@nestjs/jwt';
import { errorMsg } from '@/constants';
import { createFakeUser, createUserRegisterDTO } from '@/utils/test/mocks';

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<Pick<UserService, 'findByEmail' | 'create'>>;
  let credentialsService: jest.Mocked<Pick<CredentialsService, 'create'>>;

  beforeEach(async () => {
    userService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    credentialsService = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: userService,
        },
        {
          provide: CredentialsService,
          useValue: credentialsService,
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn() }, // minimal mock, not used in register
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a new user and store credentials when data is valid', async () => {
      const fakeUser = createFakeUser();
      const registerDTO = createUserRegisterDTO(fakeUser);

      userService.findByEmail.mockResolvedValue(fakeUser);
      userService.create.mockResolvedValue(fakeUser);
      credentialsService.create.mockResolvedValue(undefined);

      const result = await service.register(registerDTO);

      expect(userService.findByEmail).toHaveBeenCalledWith(registerDTO.email);
      expect(userService.create).toHaveBeenCalledWith({
        name: registerDTO.name,
        lastName: registerDTO.lastName,
        email: registerDTO.email,
        role: registerDTO.role,
      });
      expect(credentialsService.create).toHaveBeenCalledWith({
        userId: fakeUser.id,
        password: registerDTO.password,
      });
      expect(result).toEqual(fakeUser);
    });

    it('should throw ConflictException when email is already registered', async () => {
      const existingUser = createFakeUser({ email: 'admin@empresa.com' });
      const registerDTO = createUserRegisterDTO(existingUser);

      userService.findByEmail.mockResolvedValue(existingUser);

      await expect(service.register(registerDTO)).rejects.toThrow(
        new ConflictException(errorMsg.EMAIL_ALREADY_REGISTERED),
      );
      expect(userService.findByEmail).toHaveBeenCalledWith(registerDTO.email);
      expect(userService.create).not.toHaveBeenCalled();
      expect(credentialsService.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when password is weak', async () => {
      const fakeUser = createFakeUser();
      const registerDTO = {
        ...createUserRegisterDTO(fakeUser),
        password: '123',
      };

      userService.findByEmail.mockResolvedValue(fakeUser);

      await expect(service.register(registerDTO)).rejects.toThrow(
        new BadRequestException(errorMsg.WEAK_PASSWORD),
      );
      expect(userService.findByEmail).toHaveBeenCalledWith(registerDTO.email);
      expect(userService.create).not.toHaveBeenCalled();
      expect(credentialsService.create).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException when user creation fails unexpectedly', async () => {
      const fakeUser = createFakeUser();
      const registerDTO = createUserRegisterDTO(fakeUser);

      userService.findByEmail.mockResolvedValue(fakeUser);
      userService.create.mockRejectedValue(new Error('Database connection lost'));

      await expect(service.register(registerDTO)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(userService.findByEmail).toHaveBeenCalledWith(registerDTO.email);
      expect(userService.create).toHaveBeenCalled();
      expect(credentialsService.create).not.toHaveBeenCalled();
    });
  });
});
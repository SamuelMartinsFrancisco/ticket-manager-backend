import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../users/user.service';
import { CredentialsService } from './credentials/credentials.service';
import { JwtService } from '@nestjs/jwt';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { createFakeUser, createUserRegisterDTO } from '@/utils/test/mocks';

const mockUserService = {
  create: jest.fn(),
  findByEmail: jest.fn(),
};

const mockCredentialsService = {
  create: jest.fn(),
  validatePassword: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: CredentialsService, useValue: mockCredentialsService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user with valid data', async () => {
      const user = createFakeUser();
      const registerDto = createUserRegisterDTO(user);

      jest.mocked(mockUserService.create).mockResolvedValue(user);
      jest.mocked(mockCredentialsService.create).mockResolvedValue(undefined);

      const result = await service.register(registerDto);

      expect(mockUserService.create).toHaveBeenCalledWith({
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      });
      expect(mockCredentialsService.create).toHaveBeenCalledWith({
        userId: user.id,
        password: registerDto.password,
      });
      expect(result).toEqual(user);
    });

    it('should throw ConflictException when email already exists', async () => {
      const user = createFakeUser();
      const registerDto = createUserRegisterDTO(user);

      jest
        .mocked(mockUserService.create)
        .mockRejectedValue(new ConflictException());

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockUserService.create).toHaveBeenCalledTimes(1);
      expect(mockCredentialsService.create).not.toHaveBeenCalled();
    });

    it('should propagate error when credentialsService.create fails after user creation', async () => {
      const user = createFakeUser();
      const registerDto = createUserRegisterDTO(user);
      const creationError = new Error('DB write failure');

      jest.mocked(mockUserService.create).mockResolvedValue(user);
      jest.mocked(mockCredentialsService.create).mockRejectedValue(creationError);

      await expect(service.register(registerDto)).rejects.toThrow(creationError);
      expect(mockUserService.create).toHaveBeenCalledTimes(1);
      expect(mockCredentialsService.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('login', () => {
    const email = 'novo.usuario@empresa.com';
    const password = 'Senha@123';
    const user = createFakeUser({ email });

    it('should return access token on valid credentials', async () => {
      const token = 'jwt_token';

      jest.mocked(mockUserService.findByEmail).mockResolvedValue(user);
      jest.mocked(mockCredentialsService.validatePassword).mockResolvedValue(true);
      jest.mocked(mockJwtService.signAsync).mockResolvedValue(token);

      const result = await service.login(email, password);

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(email);
      expect(mockCredentialsService.validatePassword).toHaveBeenCalledWith(
        user.id,
        password,
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: user.id,
        username: user.name,
        email: user.email,
        role: user.role,
      });
      expect(result).toEqual({ access_token: token });
    });

    it('should throw UnauthorizedException when email does not exist', async () => {
      jest
        .mocked(mockUserService.findByEmail)
        .mockRejectedValue(new NotFoundException('User not found'));

      await expect(service.login(email, password)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );

      expect(mockCredentialsService.validatePassword).not.toHaveBeenCalled();
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      jest.mocked(mockUserService.findByEmail).mockResolvedValue(user);
      jest.mocked(mockCredentialsService.validatePassword).mockResolvedValue(false);

      await expect(service.login(email, password)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(email);
      expect(mockCredentialsService.validatePassword).toHaveBeenCalledWith(
        user.id,
        password,
      );
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should re-throw unexpected errors from validatePassword', async () => {
      const dbError = new Error('Connection lost');

      jest.mocked(mockUserService.findByEmail).mockResolvedValue(user);
      jest.mocked(mockCredentialsService.validatePassword).mockRejectedValue(dbError);

      await expect(service.login(email, password)).rejects.toThrow(dbError);

      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });
  });
});
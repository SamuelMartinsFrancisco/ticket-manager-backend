import { SeedsService } from './seeds.service';
import { UserRepository } from '@/modules/users/user.repository';
import { CredentialsRepository } from '@/modules/auth/credentials/credentials.repository';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { UserRole } from '@/modules/users/user.dto';

describe('SeedsService', () => {
  let service: SeedsService;
  let userRepository: jest.Mocked<UserRepository>;
  let credentialsRepository: jest.Mocked<CredentialsRepository>;
  let configService: jest.Mocked<ConfigService>;
  let consoleLogSpy: jest.SpyInstance;

  const mockAdminEmail = 'admin@test.com';
  const mockAdminPassword = 'supersecret';
  const mockAdminName = 'Admin';
  const mockAdminLastName = 'User';

  const mockCreatedUser = {
    id: 'admin-id-123',
    name: mockAdminName,
    lastName: mockAdminLastName,
    email: mockAdminEmail,
    role: UserRole.ADMIN,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: null,
  };

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    } as any;

    credentialsRepository = {
      create: jest.fn(),
    } as any;

    configService = {
      get: jest.fn(),
    } as any;

    service = new SeedsService(userRepository, credentialsRepository, configService);

    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe('seed', () => {
    describe('when admin does not exist', () => {
      beforeEach(() => {
        configService.get.mockImplementation((key: string) => {
          switch (key) {
            case 'ADMIN_EMAIL':
              return mockAdminEmail;
            case 'ADMIN_PASSWORD':
              return mockAdminPassword;
            case 'ADMIN_NAME':
              return mockAdminName;
            case 'ADMIN_LASTNAME':
              return mockAdminLastName;
            default:
              return undefined;
          }
        });

        userRepository.findByEmail.mockRejectedValue(new NotFoundException());
        userRepository.create.mockResolvedValue(mockCreatedUser);
        credentialsRepository.create.mockResolvedValue(undefined);
      });

      it('should create admin user and credentials', async () => {
        await service.seed();

        expect(userRepository.findByEmail).toHaveBeenCalledWith(mockAdminEmail);
        expect(userRepository.create).toHaveBeenCalledWith({
          email: mockAdminEmail,
          name: mockAdminName,
          lastName: mockAdminLastName,
          role: UserRole.ADMIN,
        });
        expect(credentialsRepository.create).toHaveBeenCalledWith({
          userId: mockCreatedUser.id,
          password: mockAdminPassword,
        });
        expect(consoleLogSpy).not.toHaveBeenCalledWith(
          expect.stringContaining('Admin user already created'),
        );
      });
    });

    describe('when admin already exists', () => {
      beforeEach(() => {
        configService.get.mockImplementation((key: string) => {
          if (key === 'ADMIN_EMAIL') return mockAdminEmail;
          if (key === 'ADMIN_PASSWORD') return mockAdminPassword;
          return undefined;
        });

        userRepository.findByEmail.mockResolvedValue(mockCreatedUser);
      });

      it('should skip seeding and log message', async () => {
        await service.seed();

        expect(userRepository.findByEmail).toHaveBeenCalledWith(mockAdminEmail);
        expect(userRepository.create).not.toHaveBeenCalled();
        expect(credentialsRepository.create).not.toHaveBeenCalled();
        expect(consoleLogSpy).toHaveBeenCalledWith(
          '> Admin user already created. Skipping seed...',
        );
      });
    });

    describe('when required environment variables are missing', () => {
      const expectedError = new InternalServerErrorException(
        'ADMIN_EMAIL and ADMIN_PASSWORD environmet variable must be set',
      );

      it('should throw if ADMIN_EMAIL is missing', async () => {
        configService.get.mockImplementation((key: string) => {
          if (key === 'ADMIN_PASSWORD') return mockAdminPassword;
          return undefined;
        });

        await expect(service.seed()).rejects.toThrow(expectedError);
        expect(userRepository.findByEmail).not.toHaveBeenCalled();
        expect(userRepository.create).not.toHaveBeenCalled();
        expect(credentialsRepository.create).not.toHaveBeenCalled();
      });

      it('should throw if ADMIN_PASSWORD is missing', async () => {
        configService.get.mockImplementation((key: string) => {
          if (key === 'ADMIN_EMAIL') return mockAdminEmail;
          return undefined;
        });

        await expect(service.seed()).rejects.toThrow(expectedError);
        expect(userRepository.findByEmail).not.toHaveBeenCalled();
      });

      it('should throw if both are missing', async () => {
        configService.get.mockReturnValue(undefined);

        await expect(service.seed()).rejects.toThrow(expectedError);
        expect(userRepository.findByEmail).not.toHaveBeenCalled();
      });
    });

    describe('when userRepository.findByEmail throws an unexpected error', () => {
      const dbError = new Error('Database connection lost');

      beforeEach(() => {
        configService.get.mockImplementation((key: string) => {
          if (key === 'ADMIN_EMAIL') return mockAdminEmail;
          if (key === 'ADMIN_PASSWORD') return mockAdminPassword;
          return undefined;
        });
        userRepository.findByEmail.mockRejectedValue(dbError);
      });

      it('should propagate the error', async () => {
        await expect(service.seed()).rejects.toThrow(dbError);

        expect(userRepository.create).not.toHaveBeenCalled();
        expect(credentialsRepository.create).not.toHaveBeenCalled();
      });
    });

    describe('when user creation fails', () => {
      beforeEach(() => {
        configService.get.mockImplementation((key: string) => {
          switch (key) {
            case 'ADMIN_EMAIL':
              return mockAdminEmail;
            case 'ADMIN_PASSWORD':
              return mockAdminPassword;
            case 'ADMIN_NAME':
              return mockAdminName;
            case 'ADMIN_LASTNAME':
              return mockAdminLastName;
            default:
              return undefined;
          }
        });
        userRepository.findByEmail.mockRejectedValue(new NotFoundException());
        userRepository.create.mockResolvedValue(undefined);
      });

      it('should throw InternalServerErrorException with specific message', async () => {
        await expect(service.seed()).rejects.toThrow(
          new InternalServerErrorException('Admin seeding has failed'),
        );
        expect(credentialsRepository.create).not.toHaveBeenCalled();
      });
    });

    describe('when credentials creation fails', () => {
      const credentialError = new Error('Constraint violation');

      beforeEach(() => {
        configService.get.mockImplementation((key: string) => {
          switch (key) {
            case 'ADMIN_EMAIL':
              return mockAdminEmail;
            case 'ADMIN_PASSWORD':
              return mockAdminPassword;
            case 'ADMIN_NAME':
              return mockAdminName;
            case 'ADMIN_LASTNAME':
              return mockAdminLastName;
            default:
              return undefined;
          }
        });
        userRepository.findByEmail.mockRejectedValue(new NotFoundException());
        userRepository.create.mockResolvedValue(mockCreatedUser);
        credentialsRepository.create.mockRejectedValue(credentialError);
      });

      it('should propagate the error from credentialsRepository', async () => {
        await expect(service.seed()).rejects.toThrow(credentialError);

        expect(userRepository.create).toHaveBeenCalled();
        expect(credentialsRepository.create).toHaveBeenCalled();
      });
    });
  });
});
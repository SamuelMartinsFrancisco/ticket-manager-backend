import { InternalServerErrorException } from '@nestjs/common';
import { SeedsService } from './seeds.service';
import { UserRepository } from '@/modules/users/user.repository';
import { CredentialsRepository } from '@/modules/auth/credentials/credentials.repository';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@/modules/users/user.dto';
import { createFakeUser } from '@/utils/test/mocks/auth.mock';

const mockUserRepository = {
  create: jest.fn(),
};
const mockCredentialsRepository = {
  create: jest.fn(),
};
const mockConfigService = {
  get: jest.fn(),
};

describe('SeedsService', () => {
  let service: SeedsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SeedsService(
      mockUserRepository as unknown as UserRepository,
      mockCredentialsRepository as unknown as CredentialsRepository,
      mockConfigService as unknown as ConfigService,
    );
  });

  describe('seed', () => {
    const validEmail = 'admin@test.com';
    const validPassword = 'securepass';

    it('should create admin with credentials when all env vars are set', async () => {
      const name = 'John';
      const lastName = 'Doe';
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'ADMIN_EMAIL') return validEmail;
        if (key === 'ADMIN_PASSWORD') return validPassword;
        if (key === 'ADMIN_NAME') return name;
        if (key === 'ADMIN_LASTNAME') return lastName;
        return undefined;
      });

      const adminUser = createFakeUser({
        id: 'admin-id',
        email: validEmail,
        name,
        lastName,
        role: UserRole.ADMIN,
      });
      mockUserRepository.create.mockResolvedValue(adminUser);
      mockCredentialsRepository.create.mockResolvedValue(undefined);

      await service.seed();

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        name,
        lastName,
        role: UserRole.ADMIN,
        email: validEmail,
      });
      expect(mockCredentialsRepository.create).toHaveBeenCalledWith({
        userId: adminUser.id,
        password: validPassword,
      });
    });

    it('should use default name and lastName when those env vars are missing', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'ADMIN_EMAIL') return validEmail;
        if (key === 'ADMIN_PASSWORD') return validPassword;
        return undefined;
      });

      const adminUser = createFakeUser({
        id: 'admin-id',
        email: validEmail,
        name: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
      });
      mockUserRepository.create.mockResolvedValue(adminUser);
      mockCredentialsRepository.create.mockResolvedValue(undefined);

      await service.seed();

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        name: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        email: validEmail,
      });
    });

    it('should throw InternalServerErrorException when ADMIN_EMAIL is not set', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'ADMIN_EMAIL') return undefined;
        if (key === 'ADMIN_PASSWORD') return validPassword;
        return undefined;
      });

      await expect(service.seed()).rejects.toThrow(InternalServerErrorException);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockCredentialsRepository.create).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException when ADMIN_PASSWORD is not set', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'ADMIN_EMAIL') return validEmail;
        if (key === 'ADMIN_PASSWORD') return undefined;
        return undefined;
      });

      await expect(service.seed()).rejects.toThrow(InternalServerErrorException);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockCredentialsRepository.create).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException when user creation returns falsy', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'ADMIN_EMAIL') return validEmail;
        if (key === 'ADMIN_PASSWORD') return validPassword;
        if (key === 'ADMIN_NAME') return 'A';
        if (key === 'ADMIN_LASTNAME') return 'B';
        return undefined;
      });
      mockUserRepository.create.mockResolvedValue(null);

      await expect(service.seed()).rejects.toThrow(InternalServerErrorException);
      expect(mockCredentialsRepository.create).not.toHaveBeenCalled();
    });
  });
});
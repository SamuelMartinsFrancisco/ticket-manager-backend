import { UserRepository } from './user.repository';
import { CryptoService } from '@/utils/crypto/crypto.service';
import { DatabaseService } from '@/infrastructure/database/database.service';
import { CreateUserDTO, UserRole } from './user.dto';
import {
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { createDatabaseMock } from '@/utils/test/mocks/commons.mock';
import * as exceptionHandlerModule from '@/utils/exceptionHandler';

jest.mock('@/utils/exceptionHandler', () => ({
  handleDatabaseException: jest.fn(),
}));

const mockCryptoService = {
  generateBlindIndex: jest.fn(),
  encryptMany: jest.fn(),
  decryptMany: jest.fn(),
};

const {
  dbServiceMock,
  selectWhereMock,
  insertReturningMock,
} = createDatabaseMock();

const userRepository = new UserRepository(
  dbServiceMock as DatabaseService,
  mockCryptoService as unknown as CryptoService,
);

describe('UserRepository', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    const userEmail = 'João.Silva@empresa.com';
    const blindIndex = 'hashed_email_index';
    const encryptedRow = {
      id: 'cb07f8e9-048a-4d33-a73f-bd71d2154d63',
      name: 'enc_name',
      lastName: 'enc_last',
      email: 'enc_email',
      emailIndex: blindIndex,
      role: 'TECHNICIAN',
      createdAt: '2026-04-14T01:40:24.803Z',
      updatedAt: null,
    };
    const decrypted = {
      name: 'João',
      lastName: 'Silva',
      email: 'joão.silva@empresa.com',
    };

    it('should return the user when found by email', async () => {
      jest.mocked(mockCryptoService.generateBlindIndex).mockReturnValue(blindIndex);
      jest.mocked(mockCryptoService.decryptMany).mockReturnValue(decrypted);
      selectWhereMock.mockResolvedValue([encryptedRow]);

      const result = await userRepository.findByEmail(userEmail);

      expect(mockCryptoService.generateBlindIndex).toHaveBeenCalledWith(userEmail);
      expect(result).toEqual({
        ...decrypted,
        id: encryptedRow.id,
        role: encryptedRow.role,
        createdAt: encryptedRow.createdAt,
        updatedAt: encryptedRow.updatedAt,
      });
    });

    it('should throw NotFoundException when user is not found', async () => {
      jest.mocked(mockCryptoService.generateBlindIndex).mockReturnValue(blindIndex);
      selectWhereMock.mockResolvedValue([]);

      await expect(userRepository.findByEmail('nonexistent@empresa.com')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should propagate decryption errors', async () => {
      jest.mocked(mockCryptoService.generateBlindIndex).mockReturnValue(blindIndex);
      selectWhereMock.mockResolvedValue([encryptedRow]);
      const decryptionError = new Error('decryption failed');
      jest.mocked(mockCryptoService.decryptMany).mockImplementation(() => {
        throw decryptionError;
      });

      await expect(userRepository.findByEmail(userEmail)).rejects.toThrow(decryptionError);
    });
  });

  describe('create', () => {
    const createUserDTO: CreateUserDTO = {
      name: '  Maria ',
      lastName: ' Oliveira ',
      email: 'MARIA.OLIVEIRA@empresa.com',
      role: UserRole.CLIENT,
    };
    const normalizedFields = {
      name: 'Maria',
      lastName: 'Oliveira',
      email: 'maria.oliveira@empresa.com',
    };
    const blindIndex = 'blind_maria';
    const encryptedFields = {
      name: 'enc_maria',
      lastName: 'enc_oliveira',
      email: 'enc_email',
    };
    const insertedRow = {
      id: 'new-uuid',
      ...encryptedFields,
      role: UserRole.CLIENT,
      createdAt: '2026-04-25T10:00:00.000Z',
      updatedAt: null,
    };

    beforeEach(() => {
      jest.mocked(mockCryptoService.generateBlindIndex).mockReturnValue(blindIndex);
      jest.mocked(mockCryptoService.encryptMany).mockReturnValue(encryptedFields);
    });

    it('should create a user successfully and return normalized data', async () => {
      insertReturningMock.mockResolvedValue([insertedRow]);

      const result = await userRepository.create(createUserDTO);

      expect(mockCryptoService.generateBlindIndex).toHaveBeenCalledWith(normalizedFields.email);
      expect(mockCryptoService.encryptMany).toHaveBeenCalledWith(normalizedFields);
      expect(result).toEqual({
        id: insertedRow.id,
        ...normalizedFields,
        role: insertedRow.role,
        createdAt: insertedRow.createdAt,
        updatedAt: insertedRow.updatedAt,
      });
    });

    it('should throw ConflictException on duplicate email', async () => {
      const duplicateError = { cause: { code: '23505' } };
      insertReturningMock.mockRejectedValue(duplicateError);
      jest
        .mocked(exceptionHandlerModule.handleDatabaseException)
        .mockImplementation(() => {
          throw new ConflictException();
        });

      await expect(userRepository.create(createUserDTO)).rejects.toThrow(ConflictException);
      expect(exceptionHandlerModule.handleDatabaseException).toHaveBeenCalledWith(duplicateError);
    });

    it('should throw InternalServerErrorException on unexpected database error', async () => {
      const unexpectedError = { cause: { code: '40001' } };
      insertReturningMock.mockRejectedValue(unexpectedError);
      jest
        .mocked(exceptionHandlerModule.handleDatabaseException)
        .mockImplementation(() => {
          throw new InternalServerErrorException();
        });

      await expect(userRepository.create(createUserDTO)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(exceptionHandlerModule.handleDatabaseException).toHaveBeenCalledWith(unexpectedError);
    });

    it('should normalize input fields (trim and lowercase email)', async () => {
      insertReturningMock.mockResolvedValue([insertedRow]);

      await userRepository.create(createUserDTO);

      expect(mockCryptoService.generateBlindIndex).toHaveBeenCalledWith(
        'maria.oliveira@empresa.com',
      );
      expect(mockCryptoService.encryptMany).toHaveBeenCalledWith({
        name: 'Maria',
        lastName: 'Oliveira',
        email: 'maria.oliveira@empresa.com',
      });
    });
  });
});
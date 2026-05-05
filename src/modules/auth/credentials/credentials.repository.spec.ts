import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import * as argon2 from 'argon2';

import { CredentialsRepository } from './credentials.repository';
import { DatabaseService } from '@/infrastructure/database/database.service';
import { credentialsTable } from '@/infrastructure/database/schema';
import { CredentialsDTO, CreateCredentialDTO } from './credentials.dto';
import { createDatabaseMock } from '@/utils/test/mocks/commons.mock';

jest.mock('argon2');

describe('CredentialsRepository', () => {
  let repository: CredentialsRepository;
  let dbServiceMock: ReturnType<typeof createDatabaseMock>['dbServiceMock'];
  let selectWhereMock: jest.Mock;
  let insertReturningMock: jest.Mock;
  let dbMock: Record<string, jest.Mock>;

  const mockHash = 'mocked_hashed_password';

  const mockCredential: CredentialsDTO = {
    userId: '550e8400-e29b-41d4-a716-446655440000',
    password: mockHash,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: null,
  };

  beforeEach(async () => {
    ({ dbServiceMock, selectWhereMock, insertReturningMock, dbMock } =
      createDatabaseMock());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CredentialsRepository,
        { provide: DatabaseService, useValue: dbServiceMock },
      ],
    }).compile();

    repository = module.get<CredentialsRepository>(CredentialsRepository);
    jest.clearAllMocks();
    jest.mocked(argon2.hash).mockResolvedValue(mockHash);
  });

  describe('findOne', () => {
    it('should return credentials when the user exists', async () => {
      selectWhereMock.mockResolvedValue([mockCredential]);

      const result = await repository.findOne(mockCredential.userId);

      expect(result).toEqual(mockCredential);
      expect(selectWhereMock).toHaveBeenCalledWith(
        eq(credentialsTable.userId, mockCredential.userId),
      );
    });

    it('should throw NotFoundException when the user does not exist', async () => {
      selectWhereMock.mockResolvedValue([]);

      await expect(
        repository.findOne('non-existent-id'),
      ).rejects.toThrow(NotFoundException);

      expect(selectWhereMock).toHaveBeenCalledWith(
        eq(credentialsTable.userId, 'non-existent-id'),
      );
    });
  });

  describe('create', () => {
    const input: CreateCredentialDTO = {
      userId: 'new-user-id',
      password: 'PlainText1!',
    };

    const expectedHashedCredential = {
      userId: input.userId,
      password: mockHash,
    };

    it('should hash the password and insert the credential', async () => {
      const valuesMock = jest
        .fn()
        .mockReturnValue({ returning: insertReturningMock });
      jest.mocked(dbMock.insert).mockReturnValue({ values: valuesMock });

      await repository.create(input);

      expect(jest.mocked(argon2.hash)).toHaveBeenCalledWith(input.password);
      expect(dbMock.insert).toHaveBeenCalledWith(credentialsTable);
      expect(valuesMock).toHaveBeenCalledWith(expectedHashedCredential);
    });

    it('should propagate database duplicate error (code 23505)', async () => {
      const error = new Error('duplicate key value violates unique constraint');
      (error as any).cause = { code: '23505' };

      const valuesThrowMock = jest.fn().mockImplementation(() => {
        throw error;
      });
      jest.mocked(dbMock.insert).mockReturnValue({ values: valuesThrowMock });

      await expect(repository.create(input)).rejects.toThrow(error);
      expect(jest.mocked(argon2.hash)).toHaveBeenCalledWith(input.password);
    });
  });
});
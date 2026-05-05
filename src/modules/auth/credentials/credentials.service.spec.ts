// credentials.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { CredentialsRepository } from './credentials.repository';
import { CreateCredentialDTO } from './credentials.dto';
import * as argon2 from 'argon2';

jest.mock('argon2');

describe('CredentialsService', () => {
  let service: CredentialsService;
  let repositoryMock: { findOne: jest.Mock; create: jest.Mock };

  const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
  const mockHash = 'hashed_password';
  const mockPlainPassword = 'PlainText1!';

  const mockCredential = {
    userId: mockUserId,
    password: mockHash,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: null as string | null,
  };

  const createMockDto: CreateCredentialDTO = {
    userId: mockUserId,
    password: mockPlainPassword,
  };

  beforeEach(async () => {
    repositoryMock = {
      findOne: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CredentialsService,
        { provide: CredentialsRepository, useValue: repositoryMock },
      ],
    }).compile();

    service = module.get<CredentialsService>(CredentialsService);

    jest.clearAllMocks();
  });

  describe('validatePassword', () => {
    it('should return true when password matches', async () => {
      repositoryMock.findOne.mockResolvedValue(mockCredential);
      jest.mocked(argon2.verify).mockResolvedValue(true);

      const result = await service.validatePassword(mockUserId, mockPlainPassword);

      expect(repositoryMock.findOne).toHaveBeenCalledWith(mockUserId);
      expect(jest.mocked(argon2.verify)).toHaveBeenCalledWith(mockHash, mockPlainPassword);
      expect(result).toBe(true);
    });

    it('should return false when password does not match', async () => {
      repositoryMock.findOne.mockResolvedValue(mockCredential);
      jest.mocked(argon2.verify).mockResolvedValue(false);

      const result = await service.validatePassword(mockUserId, 'wrong-password');

      expect(result).toBe(false);
    });

    it('should propagate NotFoundException when repository throws', async () => {
      const notFoundError = new NotFoundException();
      repositoryMock.findOne.mockRejectedValue(notFoundError);

      await expect(service.validatePassword('unknown', 'any'))
        .rejects.toThrow(NotFoundException);

      expect(jest.mocked(argon2.verify)).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should call repository.create and return its result', async () => {
      const expectedResult = { ...mockCredential };
      repositoryMock.create.mockResolvedValue(expectedResult);

      const result = await service.create(createMockDto);

      expect(repositoryMock.create).toHaveBeenCalledWith(createMockDto);
      expect(result).toBe(expectedResult);
    });

    it('should throw InternalServerErrorException when repository throws', async () => {
      repositoryMock.create.mockImplementation(() => {
        throw new Error('DB error');
      });

      await expect(service.create(createMockDto)).rejects.toThrow(InternalServerErrorException);
    });
  });
});
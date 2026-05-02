import { Test, TestingModule } from '@nestjs/testing';
import { IssueCategoryRepository } from './issue-category.repository';
import { DatabaseService } from '@/infrastructure/database/database.service';
import { issueCategoriesTable } from '@/infrastructure/database/schema';
import { CreateIssueCategoryDTO } from './issue-category.dto';
import { handleDatabaseException } from '@/utils/exceptionHandler';
import { NotFoundException } from '@nestjs/common';
import { createDatabaseMock } from '@/utils/test/mocks/commons.mock';
import { createFakeIssueCategoryDTO } from '@/utils/test/mocks/issue-category.mock';

jest.mock('@/infrastructure/database/schema', () => ({
  issueCategoriesTable: Symbol('issueCategoriesTable'),
}));

jest.mock('@/utils/exceptionHandler', () => ({
  handleDatabaseException: jest.fn(),
}));

const createFakeCreateDTO = (label = 'Bug', description?: string): CreateIssueCategoryDTO => {
  const dto: CreateIssueCategoryDTO = { label };
  if (description !== undefined) {
    dto.description = description;
  }
  return dto;
};

describe('IssueCategoryRepository', () => {
  let repository: IssueCategoryRepository;
  let selectWhereMock: jest.Mock;
  let insertReturningMock: jest.Mock;
  let selectFromMock: jest.Mock;
  let insertValuesMock: jest.Mock;

  beforeEach(async () => {
    const {
      dbServiceMock,
      selectWhereMock: whereMock,
      insertReturningMock: returningMock,
      selectFromMock: fromMock,
      insertValuesMock: valuesMock,
    } = createDatabaseMock();

    selectWhereMock = whereMock;
    insertReturningMock = returningMock;
    selectFromMock = fromMock;
    insertValuesMock = valuesMock;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IssueCategoryRepository,
        { provide: DatabaseService, useValue: dbServiceMock },
      ],
    }).compile();

    repository = module.get<IssueCategoryRepository>(IssueCategoryRepository);
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all categories', async () => {
      const categories = [createFakeIssueCategoryDTO(), createFakeIssueCategoryDTO({ id: 2, label: 'Feature' })];
      selectFromMock.mockResolvedValue(categories);

      const result = await repository.getAll();

      expect(selectFromMock).toHaveBeenCalledWith(issueCategoriesTable);
      expect(result).toEqual(categories);
    });
  });

  describe('getOne', () => {
    it('should return the category when found', async () => {
      const category = createFakeIssueCategoryDTO();
      selectWhereMock.mockResolvedValue([category]);

      const result = await repository.getOne(1);

      expect(selectFromMock).toHaveBeenCalledWith(issueCategoriesTable);
      expect(selectWhereMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual(category);
    });

    it('should throw NotFoundException when category not found', async () => {
      selectWhereMock.mockResolvedValue([]);

      await expect(repository.getOne(999)).rejects.toThrow(NotFoundException);
      await expect(repository.getOne(999)).rejects.toThrow(
        `A category with id <999> was not found;`,
      );
    });
  });

  describe('create', () => {
    it('should insert a new category and return it', async () => {
      const dto = createFakeCreateDTO('Bug', 'Details');
      const created = createFakeIssueCategoryDTO({ label: 'Bug', description: 'Details' });
      insertReturningMock.mockResolvedValue([created]);

      const result = await repository.create(dto);

      expect(insertValuesMock).toHaveBeenCalledWith(dto);
      expect(insertReturningMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual(created);
    });

    it('should handle database exceptions and return undefined', async () => {
      const dto = createFakeCreateDTO('Fail');
      const dbError = new Error('Database error');
      (dbError as any).cause = { code: '23505' };

      insertReturningMock.mockRejectedValue(dbError);

      const result = await repository.create(dto);

      expect(handleDatabaseException).toHaveBeenCalledWith(dbError);
      expect(result).toBeUndefined();
    });
  });
});
import { Test, TestingModule } from '@nestjs/testing';
import { IssueCategoryService } from './issue-category.service';
import { IssueCategoryRepository } from './issue-category.repository';
import { CreateIssueCategoryDTO, IssueCategoryDTO } from './issue-category.dto';
import { createFakeIssueCategoryDTO } from '@/utils/test/mocks/issue-category.mock';

const createFakeCreateDTO = (label = 'Bug', description?: string): CreateIssueCategoryDTO => {
  const dto: CreateIssueCategoryDTO = { label };
  if (description !== undefined) {
    dto.description = description;
  }
  return dto;
};

describe('IssueCategoryService', () => {
  let service: IssueCategoryService;
  let repository: jest.Mocked<IssueCategoryRepository>;

  const mockRepository = {
    getAll: jest.fn(),
    getOne: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IssueCategoryService,
        { provide: IssueCategoryRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<IssueCategoryService>(IssueCategoryService);
    repository = module.get<jest.Mocked<IssueCategoryRepository>>(IssueCategoryRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all categories from repository', async () => {
      const categories = [createFakeIssueCategoryDTO(), createFakeIssueCategoryDTO({ id: 2, label: 'Feature' })];
      repository.getAll.mockResolvedValue(categories);

      const result = await service.getAll();

      expect(repository.getAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(categories);
    });
  });

  describe('getOne', () => {
    it('should return a category by id from repository', async () => {
      const category = createFakeIssueCategoryDTO();
      repository.getOne.mockResolvedValue(category);

      const result = await service.getOne(1);

      expect(repository.getOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(category);
    });
  });

  describe('create', () => {
    it('should delegate to repository.create and return its result', async () => {
      const dto = createFakeCreateDTO('Bug', 'Details');
      const created = createFakeIssueCategoryDTO({ label: 'Bug', description: 'Details' });

      repository.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });
});
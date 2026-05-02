import { Test, TestingModule } from '@nestjs/testing';
import { IssueCategoryController } from './issue-category.controller';
import { IssueCategoryService } from './issue-category.service';
import { CreateIssueCategoryDTO, IssueCategoryDTO } from './issue-category.dto';
import { createFakeIssueCategoryDTO } from '@/utils/test/mocks/issue-category.mock';

const createFakeCreateDTO = (label = 'Bug', description?: string): CreateIssueCategoryDTO => {
  const dto: CreateIssueCategoryDTO = { label };
  if (description !== undefined) {
    dto.description = description;
  }
  return dto;
};

describe('IssueCategoryController', () => {
  let controller: IssueCategoryController;
  let service: jest.Mocked<IssueCategoryService>;

  const mockService = {
    getAll: jest.fn(),
    getOne: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IssueCategoryController],
      providers: [
        { provide: IssueCategoryService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<IssueCategoryController>(IssueCategoryController);
    service = module.get<jest.Mocked<IssueCategoryService>>(IssueCategoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return an array of categories', async () => {
      const categories = [createFakeIssueCategoryDTO(), createFakeIssueCategoryDTO({ id: 2, label: 'Feature' })];
      service.getAll.mockResolvedValue(categories);

      const result = await controller.getAll();

      expect(service.getAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(categories);
    });
  });

  describe('getOne', () => {
    it('should return a single category by id', async () => {
      const category = createFakeIssueCategoryDTO();
      service.getOne.mockResolvedValue(category);

      const result = await controller.getOne(1);

      expect(service.getOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(category);
    });
  });

  describe('create', () => {
    it('should create multiple categories and return the created ones', async () => {
      const dtos: CreateIssueCategoryDTO[] = [
        createFakeCreateDTO('Bug', 'Something broken'),
        createFakeCreateDTO('Feature'),
      ];

      const created1 = createFakeIssueCategoryDTO({ label: 'Bug', description: 'Something broken' });
      const created2 = createFakeIssueCategoryDTO({ id: 2, label: 'Feature', description: null });

      service.create
        .mockResolvedValueOnce(created1)
        .mockResolvedValueOnce(created2);

      const result = await controller.create(dtos);

      expect(service.create).toHaveBeenCalledTimes(2);
      expect(service.create).toHaveBeenNthCalledWith(1, { label: 'Bug', description: 'Something broken' });
      expect(service.create).toHaveBeenNthCalledWith(2, { label: 'Feature' });
      expect(result).toEqual([created1, created2]);
    });

    it('should only push truthy results from service.create', async () => {
      const dtos: CreateIssueCategoryDTO[] = [
        createFakeCreateDTO('A'),
        createFakeCreateDTO('B'),
      ];

      const validCategory = createFakeIssueCategoryDTO({ label: 'A' });

      service.create
        .mockResolvedValueOnce(validCategory)
        .mockResolvedValueOnce(null as unknown as IssueCategoryDTO);

      const result = await controller.create(dtos);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(validCategory);
    });

    it('should pass description only when provided', async () => {
      const dtoWithDesc = createFakeCreateDTO('Bug', 'Detailed');
      const dtoWithoutDesc = createFakeCreateDTO('Feature');

      service.create.mockResolvedValue(createFakeIssueCategoryDTO());

      await controller.create([dtoWithDesc, dtoWithoutDesc]);

      expect(service.create).toHaveBeenNthCalledWith(1, { label: 'Bug', description: 'Detailed' });
      expect(service.create).toHaveBeenNthCalledWith(2, { label: 'Feature' });
    });
  });
});
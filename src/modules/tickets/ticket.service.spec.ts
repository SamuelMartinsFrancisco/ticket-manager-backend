import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';

import { TicketService } from './ticket.service';
import { TicketRepository } from './ticket.repository';
import { IssueCategoryRepository } from './issue-category/issue-category.repository';
import { IssueStatus, CreateTicketDTO, TicketQueryFilters } from './ticket.dto';
import { UserRole } from '../users/user.dto';
import { errorMsg } from '@/constants';
import { createFakeTicket } from '@/utils/test/mocks/ticket.mock';
import { createFakeTokenPayload } from '@/utils/test/mocks/commons.mock';

const mockTicketRepository = {
  create: jest.fn(),
  getAll: jest.fn(),
  getOne: jest.fn(),
};

const mockIssueCategoryRepository = {
  getOne: jest.fn(),
};

describe('TicketService', () => {
  let service: TicketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketService,
        { provide: TicketRepository, useValue: mockTicketRepository },
        { provide: IssueCategoryRepository, useValue: mockIssueCategoryRepository },
      ],
    }).compile();

    service = module.get<TicketService>(TicketService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    const validDto: CreateTicketDTO = {
      authorId: '47c65fcf-87e8-40b0-bca2-e7d7a8bacac9',
      title: 'No internet',
      description: 'Connection lost…',
      category: 5,
      impact: 2,
      urgency: 3,
    };

    it('should create a ticket successfully', async () => {
      const expectedTicket = createFakeTicket({
        id: 1001,
        title: validDto.title,
        description: validDto.description,
        category: validDto.category,
        impact: validDto.impact,
        urgency: validDto.urgency,
        status: IssueStatus.NEW,
        priority: validDto.impact + validDto.urgency,
        authorId: 'user-abc-123',
      });

      mockIssueCategoryRepository.getOne.mockResolvedValue(undefined);
      mockTicketRepository.create.mockResolvedValue(expectedTicket);

      const result = await service.create(validDto);

      expect(result).toEqual(expectedTicket);
      expect(mockIssueCategoryRepository.getOne).toHaveBeenCalledWith(validDto.category);
      expect(mockTicketRepository.create).toHaveBeenCalledWith({
        ...validDto,
        status: IssueStatus.NEW,
        priority: validDto.impact + validDto.urgency,
      });
    });

    it('should throw BadRequestException when category does not exist', async () => {
      const dto = { ...validDto, category: 99 };
      const notFoundError = new Error('Category not found');
      (notFoundError as any).statusCode = 404;

      mockIssueCategoryRepository.getOne.mockRejectedValue(notFoundError);

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow('The category provided does not exists');
      expect(mockTicketRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when repository throws a conflict error', async () => {
      mockIssueCategoryRepository.getOne.mockResolvedValue(undefined);

      const conflictError = new Error('Conflict');
      (conflictError as any).statusCode = 409;
      mockTicketRepository.create.mockRejectedValue(conflictError);

      await expect(service.create(validDto)).rejects.toThrow(ConflictException);
      expect(mockTicketRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should throw InternalServerErrorException for generic error', async () => {
      mockIssueCategoryRepository.getOne.mockResolvedValue(undefined);

      const genericError = new Error('Some error');
      mockTicketRepository.create.mockRejectedValue(genericError);

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

      const promise = service.create(validDto);

      await expect(promise).rejects.toThrow(InternalServerErrorException);
      await expect(promise).rejects.toThrow(errorMsg.UNKNOWN);
      expect(warnSpy).toHaveBeenCalledWith(genericError);
      expect(mockTicketRepository.create).toHaveBeenCalledTimes(1);

      warnSpy.mockRestore();
    });

    it('should compute priority from impact + urgency and set status NEW', async () => {
      const minimalDto: CreateTicketDTO = {
        authorId: '47c65fcf-87e8-40b0-bca2-e7d7a8bacac9',
        title: 'Minimal',
        description: 'desc',
        category: 1,
        impact: 1,
        urgency: 4,
      };

      const expectedPriority = minimalDto.impact + minimalDto.urgency;
      const createdTicket = createFakeTicket({
        title: minimalDto.title,
        description: minimalDto.description,
        category: minimalDto.category,
        impact: minimalDto.impact,
        urgency: minimalDto.urgency,
        status: IssueStatus.NEW,
        priority: expectedPriority,
        id: 2001,
      });

      mockIssueCategoryRepository.getOne.mockResolvedValue(undefined);
      mockTicketRepository.create.mockResolvedValue(createdTicket);

      const result = await service.create(minimalDto);

      expect(result).toEqual(createdTicket);
      expect(mockTicketRepository.create).toHaveBeenCalledWith({
        ...minimalDto,
        status: IssueStatus.NEW,
        priority: expectedPriority,
      });
    });

    it('should pass through authorId from DTO without modification', async () => {
      const dtoWithAuthor: CreateTicketDTO = {
        title: 'With author',
        description: 'desc',
        category: 1,
        impact: 1,
        urgency: 1,
        authorId: 'user-A',
      };
      const createdTicket = createFakeTicket({
        ...dtoWithAuthor,
        status: IssueStatus.NEW,
        priority: 2,
      });

      mockIssueCategoryRepository.getOne.mockResolvedValue(undefined);
      mockTicketRepository.create.mockResolvedValue(createdTicket);

      const result = await service.create(dtoWithAuthor);

      expect(result?.authorId).toBe('user-A');
      expect(mockTicketRepository.create).toHaveBeenCalledWith({
        title: 'With author',
        description: 'desc',
        category: 1,
        impact: 1,
        urgency: 1,
        authorId: 'user-A',
        status: IssueStatus.NEW,
        priority: 2,
      });
    });
  });

  describe('getAll', () => {
    it('should delegate to repository with admin user and no filters', async () => {
      const adminUser = createFakeTokenPayload({ role: UserRole.ADMIN, sub: 'admin-1' });
      const tickets = [createFakeTicket()];
      mockTicketRepository.getAll.mockResolvedValue(tickets);

      const result = await service.getAll({}, adminUser);

      expect(mockTicketRepository.getAll).toHaveBeenCalledWith({}, adminUser);
      expect(result).toEqual(tickets);
    });

    it('should pass status filter for client user', async () => {
      const clientUser = createFakeTokenPayload({ role: UserRole.CLIENT, sub: 'client-1' });
      const filters: TicketQueryFilters = { status: IssueStatus.NEW };
      const tickets = [createFakeTicket({ status: IssueStatus.NEW })];
      mockTicketRepository.getAll.mockResolvedValue(tickets);

      const result = await service.getAll(filters, clientUser);

      expect(mockTicketRepository.getAll).toHaveBeenCalledWith(filters, clientUser);
      expect(result).toEqual(tickets);
    });

    it('should pass category and impact filters for technician', async () => {
      const techUser = createFakeTokenPayload({ role: UserRole.TECHNICIAN, sub: 'tech-1' });
      const filters: TicketQueryFilters = { category: 'Hardware', impact: 2 } as any;
      const tickets = [createFakeTicket()];
      mockTicketRepository.getAll.mockResolvedValue(tickets);

      const result = await service.getAll(filters, techUser);

      expect(mockTicketRepository.getAll).toHaveBeenCalledWith(filters, techUser);
      expect(result).toEqual(tickets);
    });

    it('should return empty array when no tickets exist', async () => {
      const user = createFakeTokenPayload();
      mockTicketRepository.getAll.mockResolvedValue([]);

      const result = await service.getAll({}, user);

      expect(result).toEqual([]);
      expect(mockTicketRepository.getAll).toHaveBeenCalledTimes(1);
    });
  });
});
import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';
import { TicketQueryFilters } from './ticket.dto';
import { RequestWithUser } from '../auth/auth.types';
import { createFakeTokenPayload } from '@/utils/test/mocks/commons.mock';

const originalWarn = console.warn;
beforeAll(() => {
  console.warn = jest.fn();
});
afterAll(() => {
  console.warn = originalWarn;
});

describe('TicketController', () => {
  let controller: TicketController;
  let ticketService: jest.Mocked<Pick<TicketService, 'getAll' | 'getOne' | 'create'>>;

  const mockRequest = (
    userOverrides?: Partial<RequestWithUser['user']>,
  ): RequestWithUser =>
    ({
      user: createFakeTokenPayload(userOverrides),
    }) as RequestWithUser;

  beforeAll(async () => {
    ticketService = {
      getAll: jest.fn(),
      getOne: jest.fn(),
      create: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketController],
      providers: [
        {
          provide: TicketService,
          useValue: ticketService,
        },
      ],
    }).compile();

    controller = module.get<TicketController>(TicketController);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  })

  describe('getAll', () => {
    it('should call ticketService.getAll with filters and the authenticated user, and return the result', async () => {
      const filters: TicketQueryFilters = { status: 'NEW' } as any;
      const user = mockRequest({ sub: 'u1', role: 'CLIENT' });
      const expectedTickets = [{ id: 1 }];
      ticketService.getAll.mockResolvedValue(expectedTickets as any);

      const result = await controller.getAll(filters, user);

      expect(ticketService.getAll).toHaveBeenCalledWith(filters, user.user);
      expect(result).toEqual(expectedTickets);
    });

    it('should throw NotFoundException when ticketService throws a 404 error', async () => {
      ticketService.getAll.mockRejectedValue({ status: 404 });

      await expect(
        controller.getAll({}, mockRequest() as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException when ticketService throws a 401 error', async () => {
      ticketService.getAll.mockRejectedValue({ status: 401 });

      await expect(
        controller.getAll({}, mockRequest() as any),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw InternalServerErrorException for unknown errors', async () => {
      ticketService.getAll.mockRejectedValue(new Error('db down'));

      await expect(
        controller.getAll({}, mockRequest() as any),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getOne', () => {
    it('should call ticketService.getOne with the id and return the ticket', async () => {
      const ticket = { id: 42 };
      ticketService.getOne.mockResolvedValue(ticket as any);

      const result = await controller.getOne(42);

      expect(ticketService.getOne).toHaveBeenCalledWith(42);
      expect(result).toEqual(ticket);
    });

    it('should throw NotFoundException when ticketService throws 404', async () => {
      ticketService.getOne.mockRejectedValue({ status: 404 });

      await expect(controller.getOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const validBody = {
      title: 'No internet',
      category: 5,
      impact: 2,
      urgency: 3,
    };

    it('should build the CreateTicketDTO with authorId from the request and delegate to service', async () => {
      const req = mockRequest({ sub: 'user-abc' });
      const createdTicket = { id: 1, authorId: 'user-abc', ...validBody };
      ticketService.create.mockResolvedValue(createdTicket as any);

      const result = await controller.create(req, validBody as any);

      expect(ticketService.create).toHaveBeenCalledWith({
        title: validBody.title,
        category: validBody.category,
        impact: validBody.impact,
        urgency: validBody.urgency,
        authorId: 'user-abc',
      });
      expect(result).toEqual(createdTicket);
    });

    it('should include optional description and status when they are provided', async () => {
      const req = mockRequest();
      const dto = { ...validBody, description: 'desc', status: 'IN_PROGRESS' };
      ticketService.create.mockResolvedValue({} as any);

      await controller.create(req, dto as any);

      expect(ticketService.create).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'desc', status: 'IN_PROGRESS' }),
      );
    });

    it('should omit description and status from CreateTicketDTO when not provided', async () => {
      const req = mockRequest();
      ticketService.create.mockResolvedValue({} as any);

      await controller.create(req, validBody as any);

      const callArg = ticketService.create.mock.calls[0][0];
      expect(callArg).not.toHaveProperty('description');
      expect(callArg).not.toHaveProperty('status');
    });

    it('should throw InternalServerErrorException for unknown errors', async () => {
      const req = mockRequest();
      ticketService.create.mockRejectedValue(new Error('db failure'));

      await expect(
        controller.create(req, validBody as any),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should apply the correct authorId for different authenticated users', async () => {
      const userA = mockRequest({ sub: 'user-A' });
      const userB = mockRequest({ sub: 'user-B' });
      ticketService.create.mockResolvedValue({} as any);

      await controller.create(userA, validBody as any);
      await controller.create(userB, validBody as any);

      expect(ticketService.create).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ authorId: 'user-A' }),
      );
      expect(ticketService.create).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ authorId: 'user-B' }),
      );
    });
  });
});
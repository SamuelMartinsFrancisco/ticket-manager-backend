import { Test, TestingModule } from '@nestjs/testing';
import { createDbClientMock, createFakeTicket } from '@/utils/test/mocks';
import { TicketRepository } from './ticket.repository';
import { DatabaseService } from '@/infrastructure/database/database.service';

const ticketMock = createFakeTicket();
let app: TestingModule;

describe('TicketRepository', () => {
  let ticketRepository: TicketRepository;

  beforeAll(async () => {
    const { dbClientMock } = createDbClientMock();

    app = await Test.createTestingModule({
      providers: [
        TicketRepository,
        {
          provide: DatabaseService,
          useValue: dbClientMock,
        }
      ],
    }).compile();

    ticketRepository = app.get<TicketRepository>(TicketRepository);
  });

  afterAll(async () => {
    await app.close();
  })

  describe('success scenarios', () => {
    it("should return the db operation result when receives valid data", async () => {
      const { id, createdAt, ...newTicket } = ticketMock;

      const result = await ticketRepository.create(newTicket);
      expect(result).toEqual(ticketMock);
      expect(true).toBe(true);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { TicketService } from './ticket.service';
import { createFakeTicket } from '@/utils/test/mocks';
import { TicketRepository } from './ticket.repository';

const fakeTicket = createFakeTicket();
let ticketService: TicketService;
let app: TestingModule;

describe('TicketService', () => {
  beforeAll(async () => {
    app = await Test.createTestingModule({
      providers: [
        TicketService,
        {
          provide: TicketRepository,
          useValue: {
            create: jest.fn().mockResolvedValue(fakeTicket),
          },
        },
      ],
    }).compile();

    ticketService = app.get<TicketService>(TicketService);
  });

  afterAll(async () => {
    await app.close();
  })

  describe('success scenarios', () => {
    it("should return the repository's response when receives valid data", async () => {
      const { id, createdAt, ...newTicket } = fakeTicket;

      const result = await ticketService.create(newTicket);
      expect(result).toEqual(fakeTicket);
    });
  });
});

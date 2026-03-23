import { Test, TestingModule } from '@nestjs/testing';
import { TicketService } from './ticket.service';
import { createFakeTicket } from 'src/utils/test/mocks';
import { TicketRepository } from './ticket.repository';

const ticketMock = createFakeTicket();
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
            create: jest.fn().mockResolvedValue(ticketMock),
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
      const {id, createdAt, ...newTicket} = ticketMock;

      const result = await ticketService.create(newTicket);
      expect(result).toEqual(ticketMock);
    });
  });
});

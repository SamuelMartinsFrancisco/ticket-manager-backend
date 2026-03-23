import { Test, TestingModule } from '@nestjs/testing';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';
import { createFakeTicket } from 'src/utils/test/mocks';

const ticketMock = createFakeTicket();
let ticketController: TicketController;
let app: TestingModule;

describe('TicketController', () => {
  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [TicketController],
      providers: [
        {
          provide: TicketService,
          useValue: {
            create: jest.fn().mockResolvedValue(ticketMock),
          },
        },
      ],
    }).compile();

    ticketController = app.get<TicketController>(TicketController);
  });

  describe('success scenarios', () => {
    it("should return the service's response when receives valid data", async () => {
      const {id, createdAt, ...newTicket} = ticketMock;

      const result = await ticketController.create(newTicket);
      expect(result).toEqual(ticketMock);
    });
  });
});

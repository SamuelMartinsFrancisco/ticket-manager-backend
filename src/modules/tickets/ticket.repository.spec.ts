import { Test, TestingModule } from '@nestjs/testing';
import { createDbClientMock, createFakeTicket } from 'src/utils/test/mocks';
import { DbClientMock, DbClientSpies } from 'src/utils/test/types';
import { TicketRepository } from './ticket.repository';
import { DB_CLIENT } from 'src/infrastructure/database/database.provider';

const ticketMock = createFakeTicket();

let ticketRepository: TicketRepository;
let dbClientMock: DbClientMock
let spies: DbClientSpies;

describe('TicketRepository', () => {
  beforeEach(async () => {
    const dbMockFactory = createDbClientMock();
    dbClientMock = dbMockFactory.dbClientMock;
    spies = dbMockFactory.spies;

    spies.returningFn.mockResolvedValue([ticketMock]);

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        TicketRepository,
        {
          provide: DB_CLIENT,
          useValue: dbClientMock,
        },
      ],
    }).compile();

    ticketRepository = app.get<TicketRepository>(TicketRepository);
  });

  describe('success scenarios', () => {
    it("should return the db operation result when receives valid data", async () => {
      const {id, createdAt, ...newTicket} = ticketMock;

      const result = await ticketRepository.create(newTicket);
      expect(result).toEqual(ticketMock);
    });
  });
});

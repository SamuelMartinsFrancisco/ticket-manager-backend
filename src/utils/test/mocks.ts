import { IssueStatus, TicketDTO } from "src/modules/tickets/ticket.dto"

export const createFakeTicket = (overrides?: Partial<TicketDTO>): TicketDTO => ({
  id: 12345,
  title: 'New Ticket',
  description: 'description...',
  authorId: '18a567cb',
  status: IssueStatus.NEW,
  category: 23132,
  impact: 2,
  urgency: 2,
  createdAt: new Date(1774224143781).toISOString(),
  ...overrides
});

export const createDbClientMock = () => {
  const insertFn = jest.fn();
  const valuesFn = jest.fn();
  const returningFn = jest.fn();

  insertFn.mockReturnValue({
    values: valuesFn,
  });

  valuesFn.mockReturnValue({
    returning: returningFn,
  });

  return {
    dbClientMock: {
      insert: insertFn,
    },
    spies: {
      insertFn,
      valuesFn,
      returningFn,
    },
  };
};
import { TicketDTO, IssueStatus } from "@/modules/tickets/ticket.dto";

export const createFakeTicket = (overrides?: Partial<TicketDTO>): TicketDTO => ({
  id: 12345,
  title: 'New Ticket',
  description: 'description...',
  authorId: '18a567cb',
  status: IssueStatus.NEW,
  category: 23132,
  impact: 2,
  urgency: 2,
  priority: 4,
  createdAt: new Date(1774224143781).toISOString(),
  ...overrides,
});
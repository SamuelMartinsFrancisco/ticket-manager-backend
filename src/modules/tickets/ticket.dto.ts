export enum IssueStatus {
  NEW = 1,                    // Unassigned/Untouched
  IN_PROGRESS = 2,            // Active work
  WAITING = 3,                // Waiting on anyone (customer or vendor)
  SOLVED = 4,                 // Done
};

export interface TicketDTO {
  id: number,
  title: string,
  description?: string | null,
  authorId: string,
  status: IssueStatus,
  category: number,
  impact: number,
  urgency: number,
  createdAt: string,
  updatedAt?: string | null,
};

export type CreateTicketDTO =
  Omit<TicketDTO, 'id' | 'createdAt' | 'updatedAt' | 'status'> &
  Partial<Pick<TicketDTO, 'status'>>;

export type CreateTicketDB = Omit<TicketDTO, 'id' | 'createdAt' | 'updatedAt'>;
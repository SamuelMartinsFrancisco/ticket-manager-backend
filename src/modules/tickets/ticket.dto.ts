export enum IssueStatus {
  NEW = 'Novo',                    // Unassigned/Untouched
  IN_PROGRESS = 'Em Progresso',    // Active work
  WAITING = 'Aguardando',          // Waiting on anyone (customer or vendor)
  SOLVED = 'Resolvido',            // Done
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
  priority: number,
  createdAt: string,
  updatedAt?: string | null,
};

export type CreateTicketDTO =
  Omit<TicketDTO, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'priority'> & { status?: IssueStatus }
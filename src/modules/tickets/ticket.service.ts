import { Injectable } from "@nestjs/common";
import { TicketRepository } from "./ticket.repository";
import { TicketDTO, CreateTicketDTO, IssueStatus } from "./ticket.dto";

@Injectable()
export class TicketService {
  constructor(private readonly ticketRepository: TicketRepository) { }

  async create(data: CreateTicketDTO): Promise<TicketDTO> {
    const newTicket = {
      ...data,
      status: IssueStatus.NEW,
      priority: data.impact + data.urgency,
    }

    try {
      const result = await this.ticketRepository.create(newTicket);

      return result;
    } catch (error) {
      console.error('Ticket creation has failed. Error details:\n', error);

      throw error;
    }
  }
}
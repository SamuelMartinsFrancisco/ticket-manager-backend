import { Controller, Post, Body } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDTO, TicketDTO } from './ticket.dto';

@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  async create(
    @Body() data: CreateTicketDTO
  ): Promise<TicketDTO> {
    const { description, status, ...required } = data;

    const newTicket: CreateTicketDTO = {
      title: required.title, 
      authorId: required.authorId,
      category: required.category,
      impact: required.impact,
      urgency: required.urgency,
    };

    if (description) {
      newTicket.description = description;
    }

    if (status) {
      newTicket.status = status;
    }
    
    return await this.ticketService.create(newTicket);
  }
}

import { Controller, Post, Body, Request } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDTO, TicketDTO } from './ticket.dto';
import { RequestWithUser } from '../auth/auth.types';
import { Roles } from '@/core/guards/rbac/roles.decorator';
import { UserRole } from '../users/user.dto';

@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) { }

  @Post()
  @Roles(UserRole.CLIENT, UserRole.TECHNICIAN, UserRole.ADMIN)
  async create(
    @Request() request: RequestWithUser,
    @Body() data: Omit<CreateTicketDTO, 'authorId'> & { authorId?: string }
  ): Promise<TicketDTO> {
    const { user } = request;
    const { description, status, authorId, ...required } = data;

    const newTicket: CreateTicketDTO = {
      title: required.title,
      category: required.category,
      authorId: authorId ?? user.sub,
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

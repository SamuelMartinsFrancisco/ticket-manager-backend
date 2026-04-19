import { Controller, Post, Body, Request, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDTO, TicketDTO } from './ticket.dto';
import { RequestWithUser } from '../auth/auth.types';
import { OmitType } from '@nestjs/swagger';
import { CreateTicketResponseDocs, GetAllTicketsResponseDocs, GetOneTicketResponseDocs } from './ticket-swager.decorator';
import { handleException } from '@/utils/exceptionHandler';

export class CreateTicketDTOWithoutUserId extends OmitType(CreateTicketDTO, ['authorId']) { };

@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) { }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @GetOneTicketResponseDocs()
  async getOne(@Param() id: number) {
    try {
      return await this.ticketService.getOne(id);
    } catch (error: any) {
      handleException(error);
      return;
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @GetAllTicketsResponseDocs()
  async getAll() {
    try {
      return await this.ticketService.getAll();
    } catch (error) {
      handleException(error);
      return;
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CreateTicketResponseDocs()
  async create(
    @Request() request: RequestWithUser,
    @Body() data: CreateTicketDTOWithoutUserId
  ): Promise<TicketDTO> {
    const { user } = request;
    const { description, status, ...required } = data;

    const newTicket: CreateTicketDTO = {
      title: required.title,
      category: required.category,
      authorId: user.sub,
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

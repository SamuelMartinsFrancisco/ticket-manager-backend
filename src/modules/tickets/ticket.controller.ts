import { Controller, Post, Body, Request, Get, HttpCode, HttpStatus, Param, ParseIntPipe } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDTO, TicketDTO } from './ticket.dto';
import { RequestWithUser } from '../auth/auth.types';
import { ApiParam, OmitType } from '@nestjs/swagger';
import { CreateTicketDocs, GetAllTicketsDocs, GetOneTicketDocs } from './ticket-swager.decorator';
import { handleException } from '@/utils/exceptionHandler';

export class CreateTicketDTOWithoutUserId extends OmitType(CreateTicketDTO, ['authorId']) { };

@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) { }

  @Get()
  @HttpCode(HttpStatus.OK)
  @GetAllTicketsDocs()
  async getAll() {
    try {
      return await this.ticketService.getAll();
    } catch (error) {
      handleException(error);
      return;
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @GetOneTicketDocs()
  @ApiParam({ name: 'id', description: 'O ID do chamado', example: 1 })
  async getOne(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.ticketService.getOne(id);
    } catch (error: any) {
      handleException(error);
      return;
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CreateTicketDocs()
  async create(
    @Request() request: RequestWithUser,
    @Body() data: CreateTicketDTOWithoutUserId
  ) {
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

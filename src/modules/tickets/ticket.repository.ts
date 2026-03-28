import { Injectable } from "@nestjs/common";
import { DatabaseService } from "src/infrastructure/database/database.service";
import { ticketsTable } from "src/infrastructure/database/schema";
import { TicketDTO, CreateTicketDB } from "./ticket.dto";
import { createFakeTicket } from "src/utils/test/mocks";

@Injectable()
export class TicketRepository {
  constructor(
    private readonly databaseService: DatabaseService
  ) { }

  async create(newTicket: CreateTicketDB): Promise<TicketDTO> {
    const [result] = await this.databaseService.db
      .insert(ticketsTable)
      .values(newTicket)
      .returning();

    return result;
  }
}

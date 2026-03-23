import { ticketsTable } from "src/infrastructure/database/schema/ticket.schema";
import { TicketDTO, CreateTicketDB } from "./ticket.dto";
import { DbClient } from "src/infrastructure/database";
import { InjectDbClient } from "src/infrastructure/database/database.provider";
import { Injectable } from "@nestjs/common";

@Injectable()
export class TicketRepository {
  constructor(
    @InjectDbClient() private readonly db: DbClient
  ) {}

  async create(newTicket: CreateTicketDB): Promise<TicketDTO> {
    const [result] = await this.db
      .insert(ticketsTable)
      .values(newTicket)
      .returning();

    return result;
  }
}

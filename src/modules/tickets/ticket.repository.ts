import { Injectable } from "@nestjs/common";
import { DatabaseService } from "@/infrastructure/database/database.service";
import { ticketsTable } from "@/infrastructure/database/schema";
import { TicketDTO } from "./ticket.dto";

type InsertTicket = typeof ticketsTable.$inferInsert;

@Injectable()
export class TicketRepository {
  constructor(
    private readonly databaseService: DatabaseService
  ) { }

  async create(newTicket: InsertTicket): Promise<TicketDTO> {
    const [result] = await this.databaseService.db
      .insert(ticketsTable)
      .values(newTicket)
      .returning();

    return result;
  }
}

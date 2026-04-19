import { Injectable } from "@nestjs/common";
import { DatabaseService } from "@/infrastructure/database/database.service";
import { ticketsTable } from "@/infrastructure/database/schema";
import { TicketDTO } from "./ticket.dto";
import { eq } from "drizzle-orm";

type InsertTicket = typeof ticketsTable.$inferInsert;

@Injectable()
export class TicketRepository {
  constructor(
    private readonly databaseService: DatabaseService
  ) { }

  async getAll(): Promise<TicketDTO[]> {
    const result = await this.databaseService.db
      .select()
      .from(ticketsTable);

    return result;
  }

  async getOne(id: number): Promise<TicketDTO> {
    const [result] = await this.databaseService.db
      .select()
      .from(ticketsTable)
      .where(eq(ticketsTable.id, id));

    return result;
  }

  async create(newTicket: InsertTicket): Promise<TicketDTO> {
    const [result] = await this.databaseService.db
      .insert(ticketsTable)
      .values(newTicket)
      .returning();

    return result;
  }
}

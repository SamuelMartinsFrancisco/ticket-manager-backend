import { Injectable } from "@nestjs/common";
import { DatabaseService } from "@/infrastructure/database/database.service";
import { ticketsTable } from "@/infrastructure/database/schema";
import { TicketDTO, TicketQueryFilters } from "./ticket.dto";
import { and, desc, eq } from "drizzle-orm";
import { TokenPayload } from "../auth/auth.types";
import { UserDTO, UserRole } from "../users/user.dto";

type InsertTicket = typeof ticketsTable.$inferInsert;

@Injectable()
export class TicketRepository {
  constructor(
    private readonly databaseService: DatabaseService
  ) { }

  async getAll(filters: TicketQueryFilters, user: TokenPayload): Promise<TicketDTO[]> {
    const treatedFilters = filters;

    if (user.role === UserRole.CLIENT) {
      treatedFilters.ownerId = user.sub;
    }

    const { ownerId, status, category } = treatedFilters;

    const result = await this.databaseService.db
      .select()
      .from(ticketsTable)
      .where(
        and(
          ownerId ? eq(ticketsTable.authorId, ownerId) : undefined,
          status ? eq(ticketsTable.status, status) : undefined,
          category ? eq(ticketsTable.category, category) : undefined,
        )
      )
      .orderBy(desc(ticketsTable.priority));

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

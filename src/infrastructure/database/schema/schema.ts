import { credentialsTable } from "./credential.schema";
import { issueCategoriesTable, ticketsHistoryTable, ticketsTable } from "./ticket.schema"
import { usersTable } from "./user.schema";

export const schema = {
  tickets: ticketsTable,
  issue_categories: issueCategoriesTable,
  tickets_history: ticketsHistoryTable,
  users: usersTable,
  credentials: credentialsTable
}

export type TicketManagerSchemas = typeof schema;
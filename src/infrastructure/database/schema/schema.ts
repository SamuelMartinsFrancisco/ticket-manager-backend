import { ticketsTable } from "./ticket.schema"

export const schema = {
  tickets: ticketsTable,
}

export type TicketManagerSchemas = typeof schema;
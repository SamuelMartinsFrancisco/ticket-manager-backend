import { type drizzle } from "drizzle-orm/node-postgres";
import { TicketManagerSchemas } from "./schema";

export type DrizzleClient = ReturnType<typeof drizzle<TicketManagerSchemas>>;

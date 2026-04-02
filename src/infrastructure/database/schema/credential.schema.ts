import { uuid, text, pgTable } from "drizzle-orm/pg-core";
import { usersTable } from "./user.schema";

export const credentialsTable = pgTable('credentials', {
  user_id: uuid().primaryKey().notNull().references(() => usersTable.id),
  email: text().notNull(),
  password: text().notNull()
});
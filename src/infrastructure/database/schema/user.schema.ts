import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const usersTable = pgTable('users', {
  id: uuid().primaryKey().notNull(),
  name: text().notNull(),
  last_name: text().notNull(),
  role: text().notNull()
});
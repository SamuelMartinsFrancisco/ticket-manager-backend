import { uuid, text, pgTable } from "drizzle-orm/pg-core";
import { usersTable } from "./user.schema";
import { timestamps } from "../shared-columns";

export const credentialsTable = pgTable('credentials', {
  userId: uuid('user_id').primaryKey().notNull().references(() => usersTable.id),
  password: text().notNull(),
  ...timestamps,
});
import { timestamp } from "drizzle-orm/pg-core";
import { NotNull } from "drizzle-orm";

export const timestamps = {
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).$onUpdate(() => new Date().toISOString())
}
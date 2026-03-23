import { integer, pgTable, text } from 'drizzle-orm/pg-core';
import { timestamps } from '../helpers/shared-columns';

export const ticketsTable = pgTable('tickets', {
  ...timestamps,
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: text().notNull(),
  description: text(),
  authorId: text('author_id').notNull(), //.references(() => user.id)
  status: integer().notNull(),
  category: integer().notNull().references(() => issueCategoryTable.id),
  impact: integer().notNull(),
  urgency: integer().notNull(),
});

export const issueCategoryTable = pgTable('issue_category', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  label: text().notNull(),
  description: text(),
});
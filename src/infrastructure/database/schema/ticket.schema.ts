import { integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { timestamps } from '../shared-columns';
import { usersTable } from './user.schema';
import { IssueStatus } from 'src/modules/tickets/ticket.dto';

const pgStatusEnum = pgEnum(
  'status',
  Object.values(IssueStatus) as [IssueStatus, ...IssueStatus[]]
);

export const ticketsTable = pgTable('tickets', {
  ...timestamps,
  authorId: text('author_id').notNull().references(() => usersTable.id),
  category: integer().notNull().references(() => issueCategoriesTable.id),
  id: integer().notNull().primaryKey().generatedAlwaysAsIdentity(),
  title: text().notNull(),
  description: text(),
  status: pgStatusEnum('status').notNull(),
  impact: integer().notNull(),
  priority: integer().notNull(),
  urgency: integer().notNull(),
});

export const issueCategoriesTable = pgTable('issue_categories', {
  id: uuid().notNull().primaryKey(),
  label: text().notNull(),
  description: text(),
});

export const ticketsHistoryTable = pgTable('tickets_history', {
  ticket_id: integer().notNull().references(() => ticketsTable.id),
  assigned_to: uuid().references(() => usersTable.id),
  id: integer().notNull().primaryKey().generatedAlwaysAsIdentity(),
  status: text().notNull(),
  timestamp: timestamp('timestamp', { mode: 'string' }),
});
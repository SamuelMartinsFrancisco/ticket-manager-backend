import { integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { timestamps } from '../shared-columns';
import { usersTable } from './user.schema';
import { IssueStatus } from '@/modules/tickets/ticket.dto';

export const pgStatusEnum = pgEnum(
  'status',
  Object.values(IssueStatus) as [IssueStatus, ...IssueStatus[]]
);

export const ticketsTable = pgTable('tickets', {
  ...timestamps,
  authorId: uuid('author_id').notNull().references(() => usersTable.id),
  category: integer().notNull().references(() => issueCategoriesTable.id),
  id: integer().notNull().primaryKey().generatedAlwaysAsIdentity().unique(),
  title: text().notNull(),
  description: text(),
  status: pgStatusEnum('status').notNull(),
  impact: integer().notNull(),
  priority: integer().notNull(),
  urgency: integer().notNull(),
});

export const issueCategoriesTable = pgTable('issue_categories', {
  id: integer().notNull().primaryKey().generatedAlwaysAsIdentity().unique(),
  label: text().notNull().unique(),
  description: text(),
});

export const ticketsHistoryTable = pgTable('tickets_history', {
  ticketId: integer('ticket_id').notNull().references(() => ticketsTable.id),
  assigned_to: uuid().references(() => usersTable.id),
  id: integer().notNull().primaryKey().generatedAlwaysAsIdentity(),
  status: text().notNull(),
  timestamp: timestamp('timestamp', { mode: 'string' }).defaultNow().notNull(),
});
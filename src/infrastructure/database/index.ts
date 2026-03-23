import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { ticketsTable } from './schema/ticket.schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const schema = {
  tickets: ticketsTable
}

export const db = drizzle(pool, { schema });

export type DbClient = typeof db;
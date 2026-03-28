import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  dialect: 'postgresql',
  schema: ['./src/infrastructure/database/schema/ticket.schema.ts'],
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});

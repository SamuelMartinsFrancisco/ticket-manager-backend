import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const databaseUrl = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

export default defineConfig({
  out: './drizzle',
  dialect: 'postgresql',
  schema: './src/infrastructure/database/schema/index.ts',
  dbCredentials: {
    url: databaseUrl,
  },
});

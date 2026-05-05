import 'dotenv/config';
import { getSecret } from '@/utils/file-secrets-reader';
import { defineConfig } from 'drizzle-kit';

const NOT_PROVIDED = '[not-provided]';

const dbUser = process.env.DB_USER ?? NOT_PROVIDED;
const dbHost = process.env.DB_HOST ?? NOT_PROVIDED;
const dbPort = process.env.DB_PORT ?? NOT_PROVIDED;
const dbName = process.env.DB_NAME ?? NOT_PROVIDED;
const dbPass = getSecret('db_password') ?? process.env.DB_PASSWORD;

const databaseUrl = getSecret('database_url') ??
  `postgres://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`;

export default defineConfig({
  out: './drizzle',
  dialect: 'postgresql',
  schema: './src/infrastructure/database/schema/index.ts',
  dbCredentials: {
    url: databaseUrl,
  },
});

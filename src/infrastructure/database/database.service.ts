import 'dotenv/config';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { schema } from './schema';
import { DrizzleClient } from './database.types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly configService: ConfigService) { }

  private pool!: Pool;
  private drizzleClient!: DrizzleClient;

  private createClient(databaseUrl: string) {
    this.pool = new Pool({
      connectionString: databaseUrl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    return drizzle(this.pool, { schema });
  }

  onModuleInit() {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');

    if (databaseUrl) {
      this.drizzleClient = this.createClient(databaseUrl);
      return;
    }

    throw Error('🔴 No database URL provided');
  }

  async onModuleDestroy() {
    await this.closeConnection();
  }

  async closeConnection() {
    await this.pool.end();
    console.log('💤 Database connection closed');
  }

  get db(): DrizzleClient {
    return this.drizzleClient;
  }
}

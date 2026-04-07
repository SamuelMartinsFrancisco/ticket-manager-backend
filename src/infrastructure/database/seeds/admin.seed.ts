// src/infrastructure/database/seeds/admin.seed.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { DatabaseService } from '@/infrastructure/database/database.service';
import { CryptoService } from '@/utils/crypto/crypto.service';
import { usersTable } from '../schema';
import { credentialsTable } from '../schema';
import * as argon2 from 'argon2';
import { randomUUID } from 'crypto';
import { UserRole } from '@/modules/users/user.dto';
import { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';

// Type-safe insert using Drizzle's inferred type
type NewUser = typeof usersTable.$inferInsert;
type NewCredential = typeof credentialsTable.$inferInsert;

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dbService = app.get(DatabaseService);

  const existing = await dbService.db.select().from(usersTable).where(eq(usersTable.role, UserRole.ADMIN)).limit(1);

  if (existing.length) {
    console.log('Admin already exists, skipping seed');
    await app.close();
    return;
  }

  const crypto = app.get(CryptoService);
  const configService = app.get(ConfigService);

  const adminId = randomUUID();
  const now = new Date().toISOString();

  // Retrieve admin credentials from environment
  const adminEmail = configService.get<string>('ADMIN_EMAIL');
  const adminPassword = configService.get<string>('ADMIN_PASSWORD');
  const adminName = configService.get<string>('ADMIN_NAME') || 'Admin';
  const adminLastName = configService.get<string>('ADMIN_LAST_NAME') || 'User';

  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment');
  }

  // Encrypt and Hash
  const encryptedName = crypto.encrypt(adminName);
  const encryptedLastName = crypto.encrypt(adminLastName);
  const encryptedEmail = crypto.encrypt(adminEmail);
  const passwordHash = await argon2.hash(adminPassword);
  const emailHash = crypto.generateBlindIndex(adminEmail)

  const userData: NewUser = {
    id: adminId,
    name: encryptedName,
    lastName: encryptedLastName,
    email: encryptedEmail,
    emailIndex: emailHash,
    role: UserRole.ADMIN,
    createdAt: now,
  };

  const credentialData: NewCredential = {
    userId: adminId,
    password: passwordHash,
    createdAt: now,
  };

  // Insert user
  await dbService.db.insert(usersTable).values(userData);

  // Insert credentials
  await dbService.db.insert(credentialsTable).values(credentialData);

  console.log('Admin user seeded successfully');
  await app.close();
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
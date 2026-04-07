import { Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "@/infrastructure/database/database.service";
import { credentialsTable } from "@/infrastructure/database/schema";
import { eq } from "drizzle-orm";
import { CredentialsDTO, CreateCredentialDTO } from "./credentials.dto";
import * as argon2 from 'argon2';

@Injectable()
export class CredentialsRepository {
  constructor(
    private readonly databaseService: DatabaseService,
  ) { }

  async findOne(userId: string): Promise<CredentialsDTO | null> {
    const [result] = await this.databaseService.db
      .select()
      .from(credentialsTable)
      .where(
        eq(credentialsTable.userId, userId)
      );

    if (!result) throw new NotFoundException();

    return result;
  }

  async create(credential: CreateCredentialDTO) {
    const hashedCredential = {
      ...credential,
      password: await argon2.hash(credential.password),
    };

    await this.databaseService.db
      .insert(credentialsTable)
      .values(hashedCredential)
  }
}
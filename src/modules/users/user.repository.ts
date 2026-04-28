import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { DatabaseService } from "@/infrastructure/database/database.service";
import { usersTable } from "@/infrastructure/database/schema";
import { eq } from "drizzle-orm";
import { CreateUserDTO, UserDTO } from "./user.dto";
import { CryptoService } from "@/utils/crypto/crypto.service";
import { randomUUID } from "node:crypto";
import { handleDatabaseException } from "@/utils/exceptionHandler";

type CryptoFields = keyof Pick<UserDTO, 'name' | 'lastName' | 'email'>;

@Injectable()
export class UserRepository {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cryptoService: CryptoService
  ) { }

  async findByEmail(userEmail: string): Promise<UserDTO> {
    const emailHash = this.cryptoService.generateBlindIndex(userEmail);

    const [result] = await this.databaseService.db
      .select()
      .from(usersTable)
      .where(
        eq(usersTable.emailIndex, emailHash)
      );

    if (!result) throw new NotFoundException();

    const { name, lastName, email, emailIndex, ...rest } = result;

    const decryptedFields = this.cryptoService.decryptMany<CryptoFields>({
      name,
      lastName,
      email
    });

    return {
      ...decryptedFields,
      ...rest
    };
  }

  async create(newUser: CreateUserDTO): Promise<UserDTO | undefined> {
    const { name, lastName, email, ...rest } = newUser;
    const normalizedCryptoFields = {
      name: name.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
    }

    const emailHash = this.cryptoService.generateBlindIndex(normalizedCryptoFields.email);
    const encryptedFields = this.cryptoService.encryptMany<CryptoFields>(normalizedCryptoFields);

    try {
      const [result] = await this.databaseService.db
        .insert(usersTable)
        .values({
          id: randomUUID(),
          emailIndex: emailHash,
          ...encryptedFields,
          ...rest,
        })
        .returning();

      const { emailIndex, ...createdUser } = result;

      return {
        ...createdUser,
        ...normalizedCryptoFields,
      };
    } catch (error: any) {
      handleDatabaseException(error);
      return;
    }
  }
}
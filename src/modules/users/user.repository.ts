import { Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "@/infrastructure/database/database.service";
import { usersTable } from "@/infrastructure/database/schema";
import { eq } from "drizzle-orm";
import { CreateUserDTO, UserDTO } from "./user.dto";
import { CryptoService } from "@/utils/crypto/crypto.service";
import { randomUUID } from "node:crypto";

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

    const { name, lastName, email, ...rest } = result;

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

  async create(newUser: CreateUserDTO): Promise<UserDTO> {
    const { name, lastName, email, ...rest } = newUser;
    const normalizedCryptoFields = {
      name: name.trim().toLowerCase(),
      lastName: lastName.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
    }

    const emailHash = this.cryptoService.generateBlindIndex(email);
    const encryptedFields = this.cryptoService.encryptMany<CryptoFields>(normalizedCryptoFields);

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
    console.warn(createdUser);

    return {
      ...createdUser,
      ...normalizedCryptoFields,
    };
  }
}
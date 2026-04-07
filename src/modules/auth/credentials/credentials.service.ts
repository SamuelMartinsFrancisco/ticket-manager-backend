import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CredentialsRepository } from './credentials.repository';
import * as argon2 from 'argon2';
import { CreateCredentialDTO } from './credentials.dto';

@Injectable()
export class CredentialsService {
  constructor(
    private readonly credentialsRepository: CredentialsRepository
  ) { }

  private async findOne(id: string) {
    const result = this.credentialsRepository.findOne(id);

    return result;
  }

  async validatePassword(userId: string, password: string): Promise<boolean> {
    const credentials = await this.findOne(userId);

    const passwordHash = credentials!.password;
    const isValid = await argon2.verify(passwordHash, password);

    return isValid;
  }

  async create(newCredential: CreateCredentialDTO) {
    try {
      const result = this.credentialsRepository.create(newCredential);

      return result;
    } catch {
      throw new InternalServerErrorException();
    }
  }
}

import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { UserRepository } from "@/modules/users/user.repository";
import { CredentialsRepository } from "@/modules/auth/credentials/credentials.repository";
import { ConfigService } from "@nestjs/config";
import { RegisterDTOWithoutId } from "@/modules/auth/auth.dto";
import { CryptoService } from "@/utils/crypto/crypto.service";
import * as argon2 from 'argon2';
import { UserRole } from "@/modules/users/user.dto";

@Injectable()
export class SeedsService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly credentialsRepository: CredentialsRepository,
    private readonly configService: ConfigService,
    private readonly cryptoService: CryptoService
  ) { }

  async seed() {
    await this.createAdmin();
  }

  private async getAdminData() {
    const email = this.configService.get<string>('ADMIN_EMAIL');
    const password = this.configService.get<string>('ADMIN_PASSWORD');
    const name = this.configService.get<string>('ADMIN_NAME') || 'Admin';
    const lastName = this.configService.get<string>('ADMIN_LAST_NAME') || 'User';

    if (!email || !password) {
      throw new InternalServerErrorException('ADMIN_EMAIL and ADMIN_PASSWORD environmet variable must be set');
    }

    const passwordHash = await argon2.hash(password);

    const adminData: RegisterDTOWithoutId = {
      name: this.cryptoService.encrypt(name),
      lastName: this.cryptoService.encrypt(lastName),
      role: UserRole.ADMIN,
      email: this.cryptoService.encrypt(email),
      password: passwordHash
    }

    return adminData;
  }

  private async createAdmin() {
    const adminData = await this.getAdminData();

    const { password, ...createUserDTO } = adminData;

    const admin = await this.userRepository.create(createUserDTO);

    if (!admin) {
      throw new InternalServerErrorException('Admin seeding has failed');
    }

    await this.credentialsRepository.create({
      userId: admin.id,
      password,
    })
  }
}
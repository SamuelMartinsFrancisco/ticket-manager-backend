import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { UserRepository } from "@/modules/users/user.repository";
import { CredentialsRepository } from "@/modules/auth/credentials/credentials.repository";
import { ConfigService } from "@nestjs/config";
import { RegisterDTOWithoutId } from "@/modules/auth/auth.dto";
import { UserRole } from "@/modules/users/user.dto";

@Injectable()
export class SeedsService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly credentialsRepository: CredentialsRepository,
    private readonly configService: ConfigService,
  ) { }

  async seed() {
    const adminData = await this.getAdminData();

    try {
      await this.userRepository.findByEmail(adminData.email);

      console.log('> Admin user already created. Skipping seed...');
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        await this.createAdmin(adminData);
        return;
      }

      throw error;
    }

  }

  private async getAdminData() {
    const email = this.configService.get<string>('ADMIN_EMAIL');
    const password = this.configService.get<string>('ADMIN_PASSWORD');
    const name = this.configService.get<string>('ADMIN_NAME') || 'Admin';
    const lastName = this.configService.get<string>('ADMIN_LASTNAME') || 'User';

    if (!email || !password) {
      throw new InternalServerErrorException('ADMIN_EMAIL and ADMIN_PASSWORD environmet variable must be set');
    }

    const adminData: RegisterDTOWithoutId = {
      name,
      lastName,
      role: UserRole.ADMIN,
      email,
      password,
    }

    return adminData;
  }

  private async createAdmin(data: RegisterDTOWithoutId) {
    const { password, ...createUserDTO } = data;

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
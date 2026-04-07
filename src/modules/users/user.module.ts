import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { CryptoModule } from '@/utils/crypto/crypto.module';
import { DatabaseModule } from '@/infrastructure/database/database.module';

@Module({
  imports: [CryptoModule, DatabaseModule],
  providers: [UserService, UserRepository],
  exports: [UserService]
})
export class UserModule { }

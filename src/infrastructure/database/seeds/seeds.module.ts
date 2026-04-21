import { Module } from '@nestjs/common';
import { SeedsService } from './seeds.service';
import { CryptoModule } from '@/utils/crypto/crypto.module';
import { ConfigModule } from '@nestjs/config';
import { CredentialsModule } from '@/modules/auth/credentials/credentials.module';
import { UserModule } from '@/modules/users/user.module';
import { DatabaseModule } from '../database.module';

@Module({
  imports: [
    CryptoModule,
    ConfigModule.forRoot({
      expandVariables: true,
    }),
    CredentialsModule,
    UserModule,
    DatabaseModule
  ],
  providers: [SeedsService],
  exports: [SeedsService],
})
export class SeedsModule { }

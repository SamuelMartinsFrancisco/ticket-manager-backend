import { Module } from '@nestjs/common';
import { SeedsService } from './seeds.service';
import { ConfigModule } from '@nestjs/config';
import { CredentialsModule } from '@/modules/auth/credentials/credentials.module';
import { UserModule } from '@/modules/users/user.module';
import { DatabaseModule } from '../database.module';

@Module({
  imports: [
    ConfigModule,
    CredentialsModule,
    UserModule,
    DatabaseModule
  ],
  providers: [SeedsService],
  exports: [SeedsService],
})
export class SeedsModule { }

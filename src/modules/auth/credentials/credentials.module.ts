import { Module } from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { CredentialsRepository } from './credentials.repository';
import { DatabaseModule } from '@/infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [CredentialsService, CredentialsRepository],
  exports: [CredentialsService]
})
export class CredentialsModule { }

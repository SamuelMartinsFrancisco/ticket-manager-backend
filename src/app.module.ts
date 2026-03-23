import { Module } from '@nestjs/common';
import { DatabaseModule } from './infrastructure/database/database.module';
import { TicketModule } from './modules/tickets/ticket.module';

@Module({
  imports: [DatabaseModule, TicketModule],
})
export class AppModule {}

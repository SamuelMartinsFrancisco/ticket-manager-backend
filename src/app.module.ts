import { Module } from '@nestjs/common';
import { TicketModule } from './modules/tickets/ticket.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      envFilePath: '.env'
    }),
    TicketModule
  ],
})
export class AppModule { }

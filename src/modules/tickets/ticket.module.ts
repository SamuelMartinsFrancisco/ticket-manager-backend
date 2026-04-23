import { Module } from '@nestjs/common';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';
import { TicketRepository } from './ticket.repository';
import { DatabaseModule } from '@/infrastructure/database/database.module';
import { IssueCategoryController } from './issue-category/issue-category.controller';
import { IssueCategoryService } from './issue-category/issue-category.service';
import { IssueCategoryRepository } from './issue-category/issue-category.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [IssueCategoryController, TicketController],
  providers: [TicketService, TicketRepository, IssueCategoryService, IssueCategoryRepository],
  exports: [TicketService]
})
export class TicketModule { }

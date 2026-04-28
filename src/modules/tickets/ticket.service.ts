import { BadRequestException, Injectable } from "@nestjs/common";
import { TicketRepository } from "./ticket.repository";
import { TicketDTO, CreateTicketDTO, IssueStatus, TicketQueryFilters } from "./ticket.dto";
import { IssueCategoryRepository } from "./issue-category/issue-category.repository";
import { handleException } from "@/utils/exceptionHandler";
import { TokenPayload } from "../auth/auth.types";

@Injectable()
export class TicketService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly issueCategoryRepository: IssueCategoryRepository
  ) { }

  async getOne(id: number): Promise<TicketDTO> {
    return await this.ticketRepository.getOne(id);
  }

  async getAll(filters: TicketQueryFilters, user: TokenPayload): Promise<TicketDTO[]> {
    return await this.ticketRepository.getAll(filters, user);
  }

  async create(data: CreateTicketDTO): Promise<TicketDTO | undefined> {
    const newTicket = {
      ...data,
      status: IssueStatus.NEW,
      priority: data.impact + data.urgency,
    }

    try {
      await this.issueCategoryRepository.getOne(newTicket.category);
      const result = await this.ticketRepository.create(newTicket);

      return result;
    } catch (error: any) {
      const categoryRegex = new RegExp('category', 'i');

      const status = error.statusCode ?? error.status;
      const categoryNotFound = status === 404 && categoryRegex.test(error?.message);

      if (categoryNotFound) {
        throw new BadRequestException('The category provided does not exists');
      }

      handleException(error);
      return;
    }
  }
}
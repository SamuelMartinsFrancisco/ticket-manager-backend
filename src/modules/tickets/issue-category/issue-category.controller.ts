import { Controller, Post, Body, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { CreateIssueCategoryDTO } from './issue-category.dto';
import { IssueCategoryService } from './issue-category.service';
import { CreateIssueCategoryResponseDocs, GetIssuesCategoriesResponseDocs } from './issue-category-swagger.decorator';
import { ApiTags } from '@nestjs/swagger';

const ISSUE_CATEGORY = 'category'

@ApiTags('Ticket')
@Controller('ticket')
export class IssueCategoryController {
  constructor(private readonly issueCategoryService: IssueCategoryService) { }

  @Get(ISSUE_CATEGORY)
  @HttpCode(HttpStatus.OK)
  @GetIssuesCategoriesResponseDocs()
  async getAll() {
    return this.issueCategoryService.getAll();
  }

  @Post(ISSUE_CATEGORY)
  @HttpCode(HttpStatus.CREATED)
  @CreateIssueCategoryResponseDocs()
  async create(
    @Body() dto: CreateIssueCategoryDTO
  ) {
    const { label, description } = dto;

    const newIssueCategory: CreateIssueCategoryDTO = { label };

    if (description) {
      newIssueCategory.description = description;
    }

    return await this.issueCategoryService.create(newIssueCategory);
  }
}

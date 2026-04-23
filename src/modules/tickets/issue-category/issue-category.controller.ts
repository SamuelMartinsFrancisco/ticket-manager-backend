import { Controller, Post, Body, Get, HttpCode, HttpStatus, Param, ParseIntPipe } from '@nestjs/common';
import { CreateIssueCategoryDTO, IssueCategoryDTO } from './issue-category.dto';
import { IssueCategoryService } from './issue-category.service';
import { CreateIssueCategoryDocs, GetIssueCategoryDocs, GetIssuesCategoriesDocs } from './issue-category-swagger.decorator';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/core/guards/rbac/roles.decorator';
import { UserRole } from '@/modules/users/user.dto';

@ApiTags('Ticket Category')
@Controller('ticket/category')
export class IssueCategoryController {
  constructor(private readonly issueCategoryService: IssueCategoryService) { }

  @Get()
  @HttpCode(HttpStatus.OK)
  @GetIssuesCategoriesDocs()
  async getAll() {
    return await this.issueCategoryService.getAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', description: 'O ID da categoria', example: 1 })
  @GetIssueCategoryDocs()
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return await this.issueCategoryService.getOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.ADMIN)
  @CreateIssueCategoryDocs()
  async create(
    @Body() dto: CreateIssueCategoryDTO[]
  ) {
    const createdCategories: IssueCategoryDTO[] = [];

    for (const item of dto) {
      const { label, description } = item;

      const newIssueCategory: CreateIssueCategoryDTO = { label };

      if (description) {
        newIssueCategory.description = description;
      }

      const result = await this.issueCategoryService.create(newIssueCategory);

      if (result) {
        createdCategories.push(result);
      }
    }

    return createdCategories;
  }
}

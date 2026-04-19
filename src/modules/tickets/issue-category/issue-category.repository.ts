import { Injectable } from "@nestjs/common";
import { DatabaseService } from "@/infrastructure/database/database.service";
import { issueCategoriesTable } from "@/infrastructure/database/schema";
import { IssueCategoryDTO, CreateIssueCategoryDTO } from "./issue-category.dto";
import { handleDatabaseException } from "@/utils/exceptionHandler";

@Injectable()
export class IssueCategoryRepository {
  constructor(
    private readonly databaseService: DatabaseService
  ) { }

  async getAll(): Promise<IssueCategoryDTO[]> {
    const result = await this.databaseService.db
      .select()
      .from(issueCategoriesTable);

    return result;
  }

  async create(newCategory: CreateIssueCategoryDTO): Promise<IssueCategoryDTO | undefined> {
    try {
      const [result] = await this.databaseService.db
        .insert(issueCategoriesTable)
        .values(newCategory)
        .returning();

      return result;
    } catch (error: any) {
      handleDatabaseException(error);
      return;
    }
  }
}

import { Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "@/infrastructure/database/database.service";
import { issueCategoriesTable } from "@/infrastructure/database/schema";
import { IssueCategoryDTO, CreateIssueCategoryDTO } from "./issue-category.dto";
import { handleDatabaseException } from "@/utils/exceptionHandler";
import { eq } from "drizzle-orm";

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

  async getOne(id: number): Promise<IssueCategoryDTO> {
    const [result] = await this.databaseService.db
      .select()
      .from(issueCategoriesTable)
      .where(eq(issueCategoriesTable.id, id));

    if (!result) {
      throw new NotFoundException(`A category with id <${id}> was not found;`);
    }

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

import { Injectable } from "@nestjs/common";
import { CreateIssueCategoryDTO, IssueCategoryDTO } from "./issue-category.dto";
import { IssueCategoryRepository } from "./issue-category.repository";

@Injectable()
export class IssueCategoryService {
  constructor(private readonly issueCategoryRepository: IssueCategoryRepository) { }

  async getAll(): Promise<IssueCategoryDTO[]> {
    return await this.issueCategoryRepository.getAll();
  }

  async getOne(id: number): Promise<IssueCategoryDTO> {
    return await this.issueCategoryRepository.getOne(id);
  }

  async create(newCategory: CreateIssueCategoryDTO): Promise<IssueCategoryDTO | undefined> {
    const result = await this.issueCategoryRepository.create(newCategory);

    return result;
  }
}
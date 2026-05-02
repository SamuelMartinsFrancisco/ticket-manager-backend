import { IssueCategoryDTO } from "@/modules/tickets/issue-category/issue-category.dto";

export const createFakeIssueCategoryDTO = (overrides?: Partial<IssueCategoryDTO>): IssueCategoryDTO => ({
  id: 1,
  label: 'Bug',
  description: 'A defect',
  ...overrides,
});
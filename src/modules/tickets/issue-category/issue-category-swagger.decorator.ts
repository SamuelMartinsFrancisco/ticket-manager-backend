import { applyDecorators } from "@nestjs/common";
import { commonCreationResponses, unauthorizedDescription } from "@/utils/docs/common-swagger.decorator";
import { ApiForbiddenResponse, ApiOkResponse, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { IssueCategoryDTO } from "./issue-category.dto";

export const CreateIssueCategoryResponseDocs = () => {
  return applyDecorators(
    commonCreationResponses({
      created: { description: 'Nova categoria criada com sucesso', type: IssueCategoryDTO }
    }),
    ApiForbiddenResponse({ description: 'Você precisa ser um admin para criar uma nova categoria' })
  )
}

export const GetIssuesCategoriesResponseDocs = () => {
  return applyDecorators(
    ApiOkResponse({ description: 'Lista de categorias recuperada com sucesso', type: IssueCategoryDTO, isArray: true }),
    ApiUnauthorizedResponse(unauthorizedDescription)
  )
}
import { applyDecorators } from "@nestjs/common";
import { commonCreationResponses, commonGetResponses, unauthorizedDescription } from "@/utils/docs/common-swagger.decorator";
import { ApiBody, ApiConflictResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { CreateIssueCategoryDTO, IssueCategoryDTO } from "./issue-category.dto";

export const CreateIssueCategoryDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Criar uma ou mais novas categorias de chamados', operationId: 'createIssueCategory' }),
    ApiBody({ type: [CreateIssueCategoryDTO] }),
    commonCreationResponses({
      created: { description: 'Nova categoria criada com sucesso', type: IssueCategoryDTO, isArray: true }
    }),
    ApiForbiddenResponse({ description: 'Você precisa ser um admin para criar uma nova categoria' }),
    ApiConflictResponse({ description: 'Já existe uma categoria com o label fornecido' })
  )
}

export const GetIssuesCategoriesDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Recuperar todas as categorias de chamados cadastradas', operationId: 'getAllIssueCategories' }),
    ApiOkResponse({ description: 'Lista de categorias recuperada com sucesso', type: IssueCategoryDTO, isArray: true }),
    ApiUnauthorizedResponse(unauthorizedDescription)
  )
}

export const GetIssueCategoryDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Recuperar uma categoria de chamado específica', operationId: 'getOneIssueCAtegory' }),
    commonGetResponses({
      ok: { description: 'Categoria recuperada com sucesso' },
      notFound: { description: 'A categoria buscada não foi encontrada' },
    })
  )
}
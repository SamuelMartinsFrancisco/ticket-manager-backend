import { applyDecorators } from "@nestjs/common";
import { ApiCreatedResponse, ApiBadRequestResponse, ApiUnauthorizedResponse, ApiOkResponse, ApiNotFoundResponse, } from "@nestjs/swagger";
import { ApiResponseNoStatusOptions } from "@nestjs/swagger";

export const unauthorizedDescription = { description: 'Token de acesso expirado ou não fornecido' };
export const badRequestDescription = { description: 'Alguma das informações parece incorreta' };

interface CommonCreationResponses {
  created?: ApiResponseNoStatusOptions,
  badRequest?: ApiResponseNoStatusOptions,
  unauthorized?: ApiResponseNoStatusOptions
}

interface CommonGetResponses {
  ok?: ApiResponseNoStatusOptions,
  notFound?: ApiResponseNoStatusOptions,
  unauthorized?: ApiResponseNoStatusOptions
}

export const commonCreationResponses = (details?: CommonCreationResponses) => {
  return applyDecorators(
    ApiCreatedResponse(details?.created),
    ApiBadRequestResponse(details?.badRequest ?? badRequestDescription),
    ApiUnauthorizedResponse(details?.unauthorized ?? unauthorizedDescription),
  )
}

export const commonGetResponses = (details?: CommonGetResponses) => {
  return applyDecorators(
    ApiOkResponse(details?.ok),
    ApiNotFoundResponse(details?.notFound),
    ApiUnauthorizedResponse(details?.unauthorized ?? unauthorizedDescription)
  )
}
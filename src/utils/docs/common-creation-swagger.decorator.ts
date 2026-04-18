import { applyDecorators } from "@nestjs/common";
import { ApiCreatedResponse, ApiBadRequestResponse, ApiUnauthorizedResponse, } from "@nestjs/swagger";
import { ApiResponseNoStatusOptions } from "@nestjs/swagger";

interface CommonCreationResponses {
  created?: ApiResponseNoStatusOptions,
  badRequest?: ApiResponseNoStatusOptions,
  unauthorized?: ApiResponseNoStatusOptions
}

export function commonCreationResponses(details?: CommonCreationResponses) {
  const unauthorizedDescription = { description: 'Token de acesso expirado ou não fornecido' };
  const badRequestDescription = { description: 'Alguma das informações parece incorreta' };

  return applyDecorators(
    ApiCreatedResponse(details?.created),
    ApiBadRequestResponse(details?.badRequest ?? badRequestDescription),
    ApiUnauthorizedResponse(details?.unauthorized ?? unauthorizedDescription),
  )
}
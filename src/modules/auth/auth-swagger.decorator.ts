import { applyDecorators } from "@nestjs/common";
import { commonCreationResponses } from "@/utils/docs/common-swagger.decorator";
import { ApiConflictResponse, ApiCreatedResponse, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { LoginResponseDTO } from "./auth.dto";

export const RegisterResponseDocs = () => {
  return applyDecorators(
    commonCreationResponses({
      created: { description: 'Usuário cadastrado com sucesso' },
    }),
    ApiConflictResponse({ description: 'Algum dos dados fornecidos já está cadastrado e não pode ser duplicado' })
  )
}

export const LoginResponseDocs = () => {
  return applyDecorators(
    ApiUnauthorizedResponse({ description: 'As credenciais fornecidas são inválidas' }),
    ApiCreatedResponse({ description: 'Autenticado com sucesso', type: LoginResponseDTO })
  )
}
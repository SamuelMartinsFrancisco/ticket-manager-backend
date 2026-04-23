import { applyDecorators } from "@nestjs/common";
import { commonCreationResponses } from "@/utils/docs/common-swagger.decorator";
import { ApiConflictResponse, ApiOkResponse, ApiOperation, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { LoginResponseDTO } from "./auth.dto";

export const RegisterDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Registrar novo usuário', operationId: 'registerUser' }),
    commonCreationResponses({
      created: { description: 'Usuário cadastrado com sucesso' },
    }),
    ApiConflictResponse({ description: 'Algum dos dados fornecidos já está cadastrado e não pode ser duplicado' })
  )
}

export const LoginDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Realizar autenticação', operationId: 'login' }),
    ApiUnauthorizedResponse({ description: 'As credenciais fornecidas são inválidas' }),
    ApiOkResponse({ description: 'Autenticado com sucesso', type: LoginResponseDTO })
  )
}
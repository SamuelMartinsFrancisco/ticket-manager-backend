import { applyDecorators } from "@nestjs/common";
import { commonCreationResponses, commonGetResponses } from "@/utils/docs/common-swagger.decorator";
import { ApiOkResponse, ApiOperation, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { unauthorizedDescription } from "@/utils/docs/common-swagger.decorator";
import { TicketDTO } from "./ticket.dto";

export const CreateTicketDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Abrir novo chamado', operationId: 'createTicket' }),
    commonCreationResponses({
      created: { description: 'O chamado foi criado com sucesso' }
    }),
  )
}

export const GetAllTicketsDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Recuperar todos os chamados', operationId: 'getAllTickets' }),
    ApiOkResponse({ description: 'Chamados recuperados com sucesso', type: TicketDTO, isArray: true }),
    ApiUnauthorizedResponse(unauthorizedDescription)
  )
}

export const GetOneTicketDocs = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Recuperar um chamado específico', operationId: 'getOneTicket' }),
    commonGetResponses({
      ok: { description: 'Chamado recuperado com sucesso', type: TicketDTO },
      notFound: { description: 'O chamado não foi encontrado' }
    })
  )
}
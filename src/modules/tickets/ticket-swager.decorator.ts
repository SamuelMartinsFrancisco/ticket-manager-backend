import { applyDecorators } from "@nestjs/common";
import { commonCreationResponses, commonGetResponses } from "@/utils/docs/common-swagger.decorator";
import { ApiOkResponse, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { unauthorizedDescription } from "@/utils/docs/common-swagger.decorator";
import { TicketDTO } from "./ticket.dto";

export const CreateTicketResponseDocs = () => {
  return applyDecorators(
    commonCreationResponses({
      created: { description: 'O chamado foi criado com sucesso' }
    }),
  )
}

export const GetAllTicketsResponseDocs = () => {
  return applyDecorators(
    ApiOkResponse({ description: 'Chamados recuperados com sucesso', type: TicketDTO }),
    ApiUnauthorizedResponse(unauthorizedDescription)
  )
}

export const GetOneTicketResponseDocs = () => {
  return applyDecorators(
    commonGetResponses({
      ok: { description: 'Chamado recuperado com sucesso', type: TicketDTO, isArray: true },
      notFound: { description: 'O chamado não foi encontrado' }
    })
  )
}
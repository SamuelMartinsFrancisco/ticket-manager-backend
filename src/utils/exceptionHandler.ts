import { ConflictException, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { errorMsg } from "@/constants";

interface ErrorMessages {
  unauthorized?: string,
  notFound?: string,
  conflict?: string,
  badRequest?: string,
  internalServerError?: string,
};


export const handleException = (error: any, messages?: ErrorMessages) => {
  const status = error.statusCode ?? error.status;
  const defaultMessage = error.message;

  switch (status) {
    case 401:
      throw new UnauthorizedException(
        messages?.unauthorized ?? defaultMessage
      );
    case 404:
      throw new NotFoundException(
        messages?.notFound ?? defaultMessage
      );
    case 409:
      throw new ConflictException(
        messages?.conflict ?? defaultMessage
      );
    default:
      console.warn(error);
      throw new InternalServerErrorException(
        messages?.internalServerError ?? errorMsg.UNKNOWN
      );
  }
}

export const handleDatabaseException = (error: any, fallbackMessage?: string) => {
  const code = error.cause?.code;

  switch (code) {
    case '23505':
      throw new ConflictException();
    default:
      console.warn(error);
      throw new InternalServerErrorException(fallbackMessage ?? errorMsg.UNKNOWN);
  }
}
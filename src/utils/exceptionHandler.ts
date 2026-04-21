import { ConflictException, InternalServerErrorException } from "@nestjs/common";
import { errorMsg } from "@/constants";

export const handleException = (error: any) => {
  const status = error.statusCode ?? error.status;

  switch (status) {
    case 401:
      if (error.message === errorMsg.INVALID_CREDENTIALS) throw error;
    case 404:
      throw error;
    case 409:
      throw error;
    default:
      console.warn(error);
      throw new InternalServerErrorException(errorMsg.UNKNOWN);
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
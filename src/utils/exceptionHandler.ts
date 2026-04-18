import { InternalServerErrorException } from "@nestjs/common";
import { errorMsg } from "@/constants";

export const handleException = (error: any) => {
  const status = error.statusCode ?? error.status;

  switch (status) {
    case 401:
      if (error.message === errorMsg.INVALID_CREDENTIALS) throw error;
    case 409:
      throw error;
    default:
      throw new InternalServerErrorException(errorMsg.UNKNOWN);
  }
}
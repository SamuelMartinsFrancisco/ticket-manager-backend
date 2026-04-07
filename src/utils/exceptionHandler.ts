import { InternalServerErrorException } from "@nestjs/common";
import { errorMsg } from "@/constants";

export const handleException = (error: any) => {
  switch (error.statusCode) {
    case 401:
      if (error.message === errorMsg.INVALID_CREDENTIALS) throw error;
    default:
      throw new InternalServerErrorException(errorMsg.UNKNOWN);
  }
}
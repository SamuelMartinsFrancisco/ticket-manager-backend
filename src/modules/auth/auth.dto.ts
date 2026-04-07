import { CreateUserDTO } from "../users/user.dto"
import { CreateCredentialDTO } from "./credentials/credentials.dto"

export interface LoginDTO {
  email: string,
  password: string,
}

export type RegisterDTO = CreateUserDTO & CreateCredentialDTO;
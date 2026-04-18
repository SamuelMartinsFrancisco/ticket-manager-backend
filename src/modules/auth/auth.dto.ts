import { PickType, IntersectionType, OmitType, ApiProperty } from "@nestjs/swagger";
import { CreateUserDTO } from "../users/user.dto";
import { CreateCredentialDTO } from "./credentials/credentials.dto";
import { IsJWT } from "class-validator";

export class LoginDTO extends IntersectionType(
  PickType(CreateUserDTO, ['email']),
  PickType(CreateCredentialDTO, ['password'])
) { }

export class LoginResponseDTO {
  @IsJWT()
  @ApiProperty({ example: '<JWT_TOKEN_WITH_USER_DATA>' })
  access_token!: string;
}

export class RegisterDTO extends IntersectionType(CreateUserDTO, CreateCredentialDTO) { }

export class RegisterDTOWithoutId extends OmitType(RegisterDTO, ['userId']) { };
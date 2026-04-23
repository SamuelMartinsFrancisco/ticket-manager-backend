import { PickType, IntersectionType, OmitType, ApiProperty } from "@nestjs/swagger";
import { CreateUserDTO } from "../users/user.dto";
import { CreateCredentialDTO } from "./credentials/credentials.dto";
import { IsJWT, IsNotEmpty, IsString } from "class-validator";

export class LoginDTO extends PickType(CreateUserDTO, ['email']) {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  password!: string
}

export class LoginResponseDTO {
  @IsJWT()
  @ApiProperty({ example: '<JWT_TOKEN_WITH_USER_DATA>' })
  access_token!: string;
}

export class RegisterDTO extends IntersectionType(CreateUserDTO, CreateCredentialDTO) { }

export class RegisterDTOWithoutId extends OmitType(RegisterDTO, ['userId']) { };
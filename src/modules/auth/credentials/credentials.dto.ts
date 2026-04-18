import { ApiProperty, PickType } from "@nestjs/swagger";
import { IsDateString, IsOptional, IsString, IsStrongPassword, IsStrongPasswordOptions, IsUUID } from "class-validator";
import { ValidationOptions } from "class-validator";

const passwordOptions = (() => {
  const constraints: IsStrongPasswordOptions = {
    minLength: 10,
    minNumbers: 2,
    minSymbols: 2,
  };

  const message: ValidationOptions = {
    message: 'The password must be at least ' +
      `${constraints.minLength} characters length, ` +
      `have ${constraints.minNumbers} numbers, ` +
      `and ${constraints.minSymbols} symbols`
  };

  return { constraints, message };
})();

export class CredentialsDTO {
  @IsUUID()
  userId!: string;

  @ApiProperty()
  @IsStrongPassword(passwordOptions.constraints, passwordOptions.message)
  @IsString()
  password!: string;

  @IsDateString()
  createdAt!: string;

  @IsOptional()
  @IsDateString()
  updatedAt?: string | null;
}

export class CreateCredentialDTO extends PickType(CredentialsDTO, ['userId', 'password']) { }
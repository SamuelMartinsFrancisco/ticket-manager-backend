import { ApiProperty, OmitType } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUUID,
  IsDateString,
  IsOptional,
  IsEnum
} from "class-validator";

export enum UserRole {
  TECHNICIAN = 'technician',
  CLIENT = 'client',
  ADMIN = 'admin',
};

export class UserDTO {
  @IsUUID()
  id!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsEnum(UserRole)
  role!: UserRole;

  @IsDateString()
  createdAt!: string;

  @IsDateString()
  @IsOptional()
  updatedAt?: string | null

}

export class CreateUserDTO extends OmitType(UserDTO, ['id', 'createdAt', 'updatedAt']) { }
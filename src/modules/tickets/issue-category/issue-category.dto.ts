import { ApiProperty, OmitType } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";

export class IssueCategoryDTO {
  @IsNumber()
  @ApiProperty()
  id!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50, { message: 'Label must not exceed 50 characters' })
  @ApiProperty()
  label!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: 'string', nullable: true })
  description?: string | null;
}

export class CreateIssueCategoryDTO extends OmitType(IssueCategoryDTO, ['id']) { }
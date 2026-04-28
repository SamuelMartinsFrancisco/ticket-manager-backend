import { applyDecorators } from "@nestjs/common";
import { ApiProperty, ApiPropertyOptional, PickType } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";

export enum IssueStatus {
  NEW = 'Novo',                    // Unassigned/Untouched
  IN_PROGRESS = 'Em Progresso',    // Active work
  WAITING = 'Aguardando',          // Waiting on anyone (customer or vendor)
  SOLVED = 'Resolvido',            // Done
};

const TicketPriorityMetrics = () => {
  return applyDecorators(
    IsNumber(),
    Min(0),
    Max(3),
  )
}

export class TicketDTO {
  @IsNumber()
  @ApiProperty()
  id!: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  title!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiPropertyOptional({ type: 'string', nullable: true })
  description?: string | null;

  @IsUUID()
  @ApiProperty()
  authorId!: string;

  @IsEnum(IssueStatus)
  @ApiProperty()
  status!: IssueStatus;

  @IsNumber()
  @ApiProperty()
  category!: number;

  @TicketPriorityMetrics()
  @ApiProperty()
  impact!: number;

  @TicketPriorityMetrics()
  @ApiProperty()
  urgency!: number;

  @IsNumber()
  priority!: number;

  @IsDateString()
  @ApiProperty()
  createdAt!: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ type: 'string', nullable: true })
  updatedAt?: string | null;
}

export class CreateTicketDTO extends PickType(TicketDTO, ['title', 'category', 'impact', 'urgency', 'description', 'authorId']) {
  @IsOptional()
  @IsEnum(IssueStatus)
  @ApiPropertyOptional({ type: 'string' })
  status?: IssueStatus;
}

export class TicketQueryFilters {
  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({ type: 'string' })
  ownerId?: string;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({ type: 'string' })
  assigneeId?: string;

  @IsOptional()
  @IsEnum(IssueStatus)
  @ApiPropertyOptional({ type: 'string' })
  status?: IssueStatus;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({ type: 'string' })
  category?: number;
}
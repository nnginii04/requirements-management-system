import { ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { IsArray, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'
import type {
  RequirementPriority,
  RequirementType,
  RequirementWorkflowStatus,
} from '../../../src/types/domain.js'

const TYPES: RequirementType[] = ['functional', 'non_functional']
const PRIORITIES: RequirementPriority[] = ['critical', 'high', 'medium', 'low']
const STATUSES: RequirementWorkflowStatus[] = [
  'draft',
  'in_review',
  'approved',
  'rejected',
  'deprecated',
]

export class CreateRequirementDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ enum: TYPES })
  @IsOptional()
  @IsIn(TYPES)
  type?: RequirementType

  @ApiPropertyOptional({ enum: PRIORITIES })
  @IsOptional()
  @IsIn(PRIORITIES)
  priority?: RequirementPriority

  @ApiPropertyOptional({ enum: STATUSES })
  @IsOptional()
  @IsIn(STATUSES)
  status?: RequirementWorkflowStatus

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  owner?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dueDate?: string

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  acceptanceCriteria?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  source?: string

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  relatedFeature?: string
}

export class UpdateRequirementDto extends PartialType(CreateRequirementDto) {}

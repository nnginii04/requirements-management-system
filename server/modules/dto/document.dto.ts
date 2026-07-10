import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ArrayNotEmpty, IsArray, IsBoolean, IsIn, IsOptional, IsString } from 'class-validator'
import type { DocumentTabType } from '../../../src/mocks/documentGenerator.js'

const DOC_TYPES: DocumentTabType[] = ['srs', 'prd', 'brs']

export class GenerateDocumentDto {
  @ApiProperty({ enum: DOC_TYPES })
  @IsIn(DOC_TYPES)
  type!: DocumentTabType

  @ApiProperty()
  @IsString()
  projectId!: string

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  requirementIds!: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  includeTraceability?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  includeNfr?: boolean
}

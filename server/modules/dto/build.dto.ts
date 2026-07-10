import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsIn, IsOptional, IsString } from 'class-validator'

export class SimulateBuildDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  commitMessage?: string

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  changedFiles?: string[]

  @ApiPropertyOptional({ enum: ['success', 'failure'] })
  @IsOptional()
  @IsIn(['success', 'failure'])
  status?: 'success' | 'failure'
}

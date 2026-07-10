import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MinLength } from 'class-validator'

export class LoginDto {
  @ApiProperty({ example: 'yejin@reqflow.dev' })
  @IsEmail()
  email!: string

  @ApiProperty({ example: 'demo1234' })
  @IsString()
  @MinLength(1)
  password!: string
}

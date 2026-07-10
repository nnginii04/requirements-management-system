import { Body, Controller, Get, HttpCode, Post, Req } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AuthService } from './auth.service.js'
import { LoginDto } from './dto/login.dto.js'
import { Public } from './public.decorator.js'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() body: LoginDto) {
    return this.auth.login(body.email, body.password).then((result) => ({ data: result }))
  }

  @ApiBearerAuth()
  @Get('me')
  me(@Req() req: { user?: { sub: string } }) {
    return { data: this.auth.me(req.user!.sub) }
  }
}

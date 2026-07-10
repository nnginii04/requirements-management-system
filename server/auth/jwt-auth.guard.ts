import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { apiError } from '../core/http-error.js'
import { IS_PUBLIC_KEY } from './public.decorator.js'

/** Global guard: requires a valid Bearer JWT unless the route is @Public(). */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true

    const req = context.switchToHttp().getRequest()
    const header: string | undefined = req.headers.authorization
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) throw apiError(401, 'Authentication required')

    try {
      req.user = this.jwt.verify(token)
      return true
    } catch {
      throw apiError(401, 'Invalid or expired token')
    }
  }
}

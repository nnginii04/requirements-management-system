import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  Logger,
  type NestInterceptor,
} from '@nestjs/common'
import type { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

/** Logs one line per request: METHOD /path → status (duration). */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP')

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp()
    const req = http.getRequest()
    const start = Date.now()
    const { method, originalUrl } = req

    return next.handle().pipe(
      tap(() => {
        const res = http.getResponse()
        this.logger.log(`${method} ${originalUrl} → ${res.statusCode} (${Date.now() - start}ms)`)
      }),
    )
  }
}

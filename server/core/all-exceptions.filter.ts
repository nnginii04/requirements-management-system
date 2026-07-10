import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'

/**
 * Normalizes every error into the API's `{ error: string }` contract and logs
 * server faults. HttpExceptions keep their status; anything else becomes a 500.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions')

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const res = ctx.getResponse()
    const req = ctx.getRequest()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = 'Internal server error'

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      message = extractMessage(exception.getResponse())
    } else if (exception instanceof Error) {
      // Unexpected fault: log the stack, but do not leak internals to the client.
      this.logger.error(`${req?.method} ${req?.url} — ${exception.message}`, exception.stack)
    }

    res.status(status).json({ error: message })
  }
}

function extractMessage(response: string | object): string {
  if (typeof response === 'string') return response
  const body = response as { error?: unknown; message?: unknown }
  // Prefer the detailed `message` (ValidationPipe emits an array of field errors)
  // over the generic `error` label ("Bad Request", "Not Found", ...).
  if (Array.isArray(body.message)) return body.message.join(', ')
  if (typeof body.message === 'string') return body.message
  if (typeof body.error === 'string') return body.error
  return 'Request failed'
}

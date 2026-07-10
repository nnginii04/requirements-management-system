import { HttpException } from '@nestjs/common'

/**
 * Build an HttpException whose body is exactly `{ error: message }`, matching the
 * response shape the frontend expects from the original Express API.
 */
export function apiError(status: number, message: string): HttpException {
  return new HttpException({ error: message }, status)
}

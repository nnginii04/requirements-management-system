import { Controller, Get } from '@nestjs/common'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Public } from '../auth/public.decorator.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

@Public()
@Controller()
export class MetaController {
  @Get('health')
  health() {
    return { status: 'ok', version: '1.0.0', service: 'reqflow-api' }
  }

  @Get('openapi.json')
  openapi() {
    const raw = readFileSync(join(__dirname, '..', 'openapi.json'), 'utf-8')
    return JSON.parse(raw)
  }
}

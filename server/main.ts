import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import type { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from './app.module.js'

const PORT = Number(process.env.PORT ?? 3001)

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Only surface warnings/errors; the store logs its own boot messages.
    logger: ['warn', 'error'],
  })

  app.enableCors()
  app.useBodyParser('json', { limit: '2mb' })
  app.setGlobalPrefix('api')

  await app.listen(PORT)
  console.log(`[reqflow-api] http://localhost:${PORT}`)
  console.log(`[reqflow-api] OpenAPI → http://localhost:${PORT}/api/openapi.json`)
}

bootstrap().catch((err) => {
  console.error(err)
  process.exit(1)
})

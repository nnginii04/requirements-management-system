import 'reflect-metadata'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import type { NestExpressApplication } from '@nestjs/platform-express'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module.js'
import { AllExceptionsFilter } from './core/all-exceptions.filter.js'
import { LoggingInterceptor } from './core/logging.interceptor.js'

const PORT = Number(process.env.PORT ?? 3001)

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['log', 'warn', 'error'],
  })

  app.enableCors()
  app.useBodyParser('json', { limit: '2mb' })
  app.setGlobalPrefix('api')

  app.useGlobalFilters(new AllExceptionsFilter())
  app.useGlobalInterceptors(new LoggingInterceptor())
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidUnknownValues: false,
    }),
  )

  const swaggerConfig = new DocumentBuilder()
    .setTitle('ReqFlow API')
    .setDescription('요구사항 관리 · 구현 검증 · 추적성 플랫폼 REST API')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api/docs', app, document)

  await app.listen(PORT)
  console.log(`[reqflow-api] http://localhost:${PORT}`)
  console.log(`[reqflow-api] Swagger UI → http://localhost:${PORT}/api/docs`)
}

bootstrap().catch((err) => {
  console.error(err)
  process.exit(1)
})

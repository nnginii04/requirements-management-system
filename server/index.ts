import express, { type RequestHandler } from 'express'
import cors from 'cors'
import { timingSafeEqual } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { seedIfEmpty } from './db/seed.js'
import { requirementsRouter } from './routes/requirements.js'
import { validationRouter } from './routes/validation.js'
import { buildsRouter } from './routes/builds.js'
import { projectsRouter } from './routes/projects.js'
import { analysisRouter } from './routes/analysis.js'
import { dashboardRouter } from './routes/dashboard.js'
import { documentsRouter } from './routes/documents.js'
import { usersRouter } from './routes/users.js'
import { versionsRouter } from './routes/versions.js'
import { traceabilityRouter } from './routes/traceability.js'
import { webhooksRouter } from './routes/webhooks.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT ?? 3001)
const IS_PRODUCTION = process.env.NODE_ENV === 'production'

/** 길이가 달라도 같은 시간이 걸리도록 비교합니다. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

/**
 * BASIC_AUTH_USER/PASSWORD 가 모두 있으면 전체 요청에 Basic Auth 를 겁니다.
 * /api/health 는 호스팅 헬스체크가 통과해야 하므로 예외입니다.
 */
function basicAuth(user: string, password: string): RequestHandler {
  return (req, res, next) => {
    if (req.path === '/api/health') return next()

    const [scheme, encoded] = (req.headers.authorization ?? '').split(' ')
    if (scheme === 'Basic' && encoded) {
      const decoded = Buffer.from(encoded, 'base64').toString('utf8')
      const separator = decoded.indexOf(':')
      if (separator !== -1) {
        const given = decoded.slice(0, separator)
        const givenPassword = decoded.slice(separator + 1)
        if (safeEqual(given, user) && safeEqual(givenPassword, password)) return next()
      }
    }

    res.setHeader('WWW-Authenticate', 'Basic realm="ReqFlow", charset="UTF-8"')
    res.status(401).json({ error: 'Unauthorized' })
  }
}

async function main() {
  await seedIfEmpty()

  const app = express()

  // 단일 호스트 배포에서는 프론트가 same-origin 이라 CORS 가 필요 없습니다.
  // 개발 모드(Vite :5173 → API :3001)와 CORS_ORIGINS 로 명시한 곳에서만 엽니다.
  const corsOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
  if (!IS_PRODUCTION) {
    app.use(cors())
  } else if (corsOrigins.length > 0) {
    app.use(cors({ origin: corsOrigins }))
  }

  // 인증은 body 파싱보다 앞에 둡니다 — 미인증 요청의 본문을 읽지 않습니다.
  const authUser = process.env.BASIC_AUTH_USER
  const authPassword = process.env.BASIC_AUTH_PASSWORD
  if (authUser && authPassword) {
    app.use(basicAuth(authUser, authPassword))
    console.log('[reqflow-api] Basic Auth 활성 (/api/health 제외)')
  } else if (IS_PRODUCTION) {
    console.warn(
      '[reqflow-api] 경고: BASIC_AUTH_USER/BASIC_AUTH_PASSWORD 가 없어 인증 없이 공개됩니다.',
    )
  }

  app.use(express.json({ limit: '2mb' }))

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', version: '1.0.0', service: 'reqflow-api' })
  })

  app.get('/api/openapi.json', (_req, res) => {
    const spec = readFileSync(join(__dirname, 'openapi.json'), 'utf-8')
    res.type('application/json').send(spec)
  })

  app.use('/api/requirements', requirementsRouter)
  app.use('/api/validation', validationRouter)
  app.use('/api/builds', buildsRouter)
  app.use('/api/projects', projectsRouter)
  app.use('/api/analysis', analysisRouter)
  app.use('/api/dashboard', dashboardRouter)
  app.use('/api/documents', documentsRouter)
  app.use('/api/users', usersRouter)
  app.use('/api/versions', versionsRouter)
  app.use('/api/traceability', traceabilityRouter)
  app.use('/api/webhooks', webhooksRouter)

  // 알 수 없는 /api 경로는 SPA fallback 으로 새지 않고 JSON 404 로 끝냅니다.
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not Found' })
  })

  // 프로덕션 단일 호스트 배포: 같은 프로세스가 빌드된 프론트도 서빙합니다.
  // client.ts 의 BASE 가 '/api' 상대경로라 오리진이 같아야 그대로 동작합니다.
  const distDir = join(__dirname, '..', 'dist')
  if (existsSync(distDir)) {
    app.use(express.static(distDir))
    app.get('*', (_req, res) => {
      res.sendFile(join(distDir, 'index.html'))
    })
  }

  app.listen(PORT, () => {
    console.log(`[reqflow-api] http://localhost:${PORT}`)
    console.log(`[reqflow-api] OpenAPI → http://localhost:${PORT}/api/openapi.json`)
    console.log(`[reqflow-api] static  → ${existsSync(distDir) ? distDir : '(dist 없음 — API 전용)'}`)
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

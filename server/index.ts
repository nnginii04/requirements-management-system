import express from 'express'
import cors from 'cors'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { seedIfEmpty } from './db/seed.js'
import { requirementsRouter } from './routes/requirements.js'
import { validationRouter } from './routes/validation.js'
import { buildsRouter } from './routes/builds.js'
import { projectsRouter } from './routes/projects.js'
import { analysisRouter } from './routes/analysis.js'
import { documentsRouter } from './routes/documents.js'
import { usersRouter } from './routes/users.js'
import { versionsRouter } from './routes/versions.js'
import { webhooksRouter } from './routes/webhooks.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT ?? 3001)

async function main() {
  await seedIfEmpty()

  const app = express()
  app.use(cors())
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
  app.use('/api/documents', documentsRouter)
  app.use('/api/users', usersRouter)
  app.use('/api/versions', versionsRouter)
  app.use('/api/webhooks', webhooksRouter)

  app.listen(PORT, () => {
    console.log(`[reqflow-api] http://localhost:${PORT}`)
    console.log(`[reqflow-api] OpenAPI → http://localhost:${PORT}/api/openapi.json`)
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

import { Router } from 'express'
import { loadDb } from '../db/store.js'
import { processJenkinsBuild } from '../services/jenkins.js'

export const buildsRouter = Router()

buildsRouter.get('/', (_req, res) => {
  const builds = [...loadDb().builds].sort((a, b) => b.buildNumber - a.buildNumber)
  res.json({ data: builds })
})

buildsRouter.get('/:buildNumber', (req, res) => {
  const buildNumber = Number(req.params.buildNumber)
  const build = loadDb().builds.find((b) => b.buildNumber === buildNumber)
  if (!build) return res.status(404).json({ error: 'Build not found' })
  res.json({ data: build })
})

buildsRouter.get('/:buildNumber/snapshots', (req, res) => {
  const buildNumber = Number(req.params.buildNumber)
  const snapshots = loadDb().snapshots.filter((s) => s.buildNumber === buildNumber)
  res.json({ data: snapshots })
})

buildsRouter.get('/requirements/:requirementId/timeline', (req, res) => {
  const snapshots = loadDb()
    .snapshots.filter((s) => s.requirementId === req.params.requirementId)
    .sort((a, b) => a.buildNumber - b.buildNumber)
  res.json({ data: snapshots })
})

/** Simulate Jenkins build for local testing */
buildsRouter.post('/simulate', (req, res) => {
  const body = req.body as {
    commitMessage?: string
    changedFiles?: string[]
    status?: 'success' | 'failure'
  }

  const result = processJenkinsBuild({
    commitMessage: body.commitMessage ?? 'feat: REQ-001 auth improvements',
    changedFiles: body.changedFiles ?? ['src/auth/AuthController.java'],
    status: body.status ?? 'success',
  })

  res.status(201).json({ data: result })
})

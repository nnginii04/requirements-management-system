import { Router } from 'express'
import { loadDb } from '../db/store.js'

export const versionsRouter = Router()

versionsRouter.get('/', (_req, res) => {
  res.json({ data: loadDb().versions })
})

versionsRouter.get('/requirements/:requirementId', (req, res) => {
  const versions = loadDb().versions.filter((v) => v.requirementId === req.params.requirementId)
  res.json({ data: versions })
})

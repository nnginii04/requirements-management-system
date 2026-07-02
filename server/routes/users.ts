import { Router } from 'express'
import { loadDb, mutate } from '../db/store.js'

export const usersRouter = Router()

usersRouter.get('/me', (_req, res) => {
  const state = loadDb()
  const user = state.users.find((u) => u.id === state.currentUserId) ?? state.users[0]
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json({ data: user })
})

usersRouter.patch('/me', (req, res) => {
  const { userId } = req.body as { userId?: string }
  if (!userId) return res.status(400).json({ error: 'userId required' })

  const state = loadDb()
  if (!state.users.some((u) => u.id === userId)) {
    return res.status(404).json({ error: 'User not found' })
  }

  mutate((s) => {
    s.currentUserId = userId
  })

  res.json({ data: loadDb().users.find((u) => u.id === userId) })
})

usersRouter.get('/', (_req, res) => {
  res.json({ data: loadDb().users })
})

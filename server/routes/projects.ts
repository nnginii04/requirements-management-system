import { Router } from 'express'
import { loadDb, mutate } from '../db/store.js'
import { calculateOverallProgress } from '../../src/utils/requirement.js'

export const projectsRouter = Router()

projectsRouter.get('/', (_req, res) => {
  const state = loadDb()
  const projects = state.projects.map((p) => {
    const reqs = state.requirements.filter((r) => r.projectId === p.id)
    return {
      ...p,
      totalRequirements: reqs.length,
      memberCount: state.users.length,
      progress: calculateOverallProgress(reqs),
    }
  })
  res.json({ data: projects })
})

projectsRouter.get('/active/current', (_req, res) => {
  const state = loadDb()
  res.json({
    data: {
      activeProjectId: state.activeProjectId,
      currentUserId: state.currentUserId,
    },
  })
})

projectsRouter.patch('/active', (req, res) => {
  const { projectId } = req.body as { projectId?: string }
  if (!projectId) return res.status(400).json({ error: 'projectId required' })

  let updated = false
  mutate((state) => {
    if (!state.projects.some((p) => p.id === projectId)) return
    state.activeProjectId = projectId
    updated = true
  })

  if (!updated) return res.status(404).json({ error: 'Project not found' })
  res.json({ data: { activeProjectId: projectId } })
})

projectsRouter.get('/:projectId', (req, res) => {
  const state = loadDb()
  const project = state.projects.find((p) => p.id === req.params.projectId)
  if (!project) return res.status(404).json({ error: 'Project not found' })

  const reqs = state.requirements.filter((r) => r.projectId === project.id)
  res.json({
    data: {
      ...project,
      totalRequirements: reqs.length,
      memberCount: state.users.length,
      progress: calculateOverallProgress(reqs),
    },
  })
})

projectsRouter.get('/:projectId/baselines', (req, res) => {
  const state = loadDb()
  const projectReqIds = new Set(
    state.requirements.filter((r) => r.projectId === req.params.projectId).map((r) => r.id),
  )
  const baselines = state.baselines.filter((b) =>
    b.requirements.some((id) => projectReqIds.has(id)),
  )
  res.json({ data: baselines })
})

projectsRouter.get('/:projectId/integrations', (req, res) => {
  const state = loadDb()
  const project = state.projects.find((p) => p.id === req.params.projectId)
  if (!project) return res.status(404).json({ error: 'Project not found' })

  const webhookCount = state.webhookEvents.length
  res.json({
    data: {
      jenkins: {
        connected: webhookCount > 0 || state.builds.length > 0,
        label: webhookCount > 0 ? '웹훅 수신 중' : '설정됨',
      },
      git: {
        connected: true,
        label: 'main 브랜치 연결',
      },
      aiEngine: {
        connected: state.validationDetails.length > 0,
        label: state.validationDetails.length > 0 ? '임베딩 엔진 활성' : '대기',
      },
    },
  })
})

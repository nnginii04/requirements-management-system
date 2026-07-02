import { Router } from 'express'
import { loadDb } from '../db/store.js'
import type { AnalysisFinding } from '../../src/types/domain.js'
import { calculateOverallProgress } from '../../src/utils/requirement.js'

export const analysisRouter = Router()

function findingsForProject(projectId: string): AnalysisFinding[] {
  const state = loadDb()
  const projectReqIds = new Set(
    state.requirements.filter((r) => r.projectId === projectId).map((r) => r.id),
  )
  return state.analysisFindings.filter((f) =>
    f.requirementIds.some((id) => projectReqIds.has(id)),
  )
}

analysisRouter.get('/projects/:projectId/findings', (req, res) => {
  res.json({ data: findingsForProject(req.params.projectId) })
})

analysisRouter.get('/projects/:projectId/summary', (req, res) => {
  const state = loadDb()
  const requirements = state.requirements.filter((r) => r.projectId === req.params.projectId)
  const findings = findingsForProject(req.params.projectId)

  res.json({
    data: {
      functionalCount: requirements.filter((r) => r.type === 'functional').length,
      nonFunctionalCount: requirements.filter((r) => r.type === 'non_functional').length,
      duplicateCandidates: findings.filter((f) => f.type === 'duplicate').length,
      conflictCandidates: findings.filter((f) => f.type === 'conflict').length,
      missingRequirements: findings.filter((f) => f.type === 'omission').length,
      traceabilityGaps: findings.filter((f) => f.type === 'traceability_gap').length,
      totalFindings: findings.length,
      overallProgress: calculateOverallProgress(requirements),
    },
  })
})

analysisRouter.get('/findings/:id', (req, res) => {
  const finding = loadDb().analysisFindings.find((f) => f.id === req.params.id)
  if (!finding) return res.status(404).json({ error: 'Finding not found' })
  res.json({ data: finding })
})

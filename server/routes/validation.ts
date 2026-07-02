import { Router } from 'express'
import { loadDb } from '../db/store.js'
import {
  calculateEstimatedScore,
  calculateSimilarityAverage,
  getValidationStatus,
} from '../../src/utils/validation.js'
import { enrichMatchesWithSnippets } from '../lib/snippets.js'
import {
  recomputeProjectValidation,
  recomputeRequirementValidation,
} from '../services/recompute.js'

export const validationRouter = Router()

function buildValidationPayload(
  requirementId: string,
  state = loadDb(),
) {
  const requirement = state.requirements.find((r) => r.id === requirementId)
  if (!requirement) return null

  let detail = state.validationDetails.find((d) => d.requirementId === requirementId)
  if (!detail) {
    return {
      requirement,
      detail: null,
      estimated: requirement.implementationScore,
      similarityAvg: 0,
      status: getValidationStatus(requirement.implementationScore),
      scoreBreakdown: null,
    }
  }

  detail = {
    ...detail,
    matches: enrichMatchesWithSnippets(detail.matches),
  }

  const estimated = calculateEstimatedScore(detail.matches, detail.acceptanceCriteriaStatus)
  const similarityAvg = calculateSimilarityAverage(detail.matches)

  return {
    requirement: { ...requirement, implementationScore: estimated },
    detail,
    estimated,
    similarityAvg,
    status: getValidationStatus(estimated),
    scoreBreakdown: {
      method: 'Top-K cosine similarity avg × 0.6 + acceptance criteria avg × 0.4',
      topK: 5,
      similarityComponent: Math.round(similarityAvg * 100),
      note: 'AI 추정치 — 확정 구현률 아님',
    },
  }
}

validationRouter.get('/', (req, res) => {
  const state = loadDb()
  const projectId = (req.query.projectId as string) || state.activeProjectId
  const requirements = state.requirements.filter((r) => r.projectId === projectId)

  const items = requirements
    .map((r) => buildValidationPayload(r.id, state))
    .filter((item): item is NonNullable<typeof item> => item !== null && item.detail !== null)
    .map((item) => ({
      requirementId: item.requirement.id,
      title: item.requirement.title,
      estimated: item.estimated,
      status: item.status,
      similarityAvg: item.similarityAvg,
      matchedFilesCount: item.detail?.matches.filter((m) => m.score >= 0.4).length ?? 0,
      missingLogicCount: item.detail?.missingLogic.length ?? 0,
    }))

  res.json({ data: items })
})

validationRouter.get('/:requirementId', (req, res) => {
  const payload = buildValidationPayload(req.params.requirementId)
  if (!payload) return res.status(404).json({ error: 'Requirement not found' })
  res.json({ data: payload })
})

validationRouter.post('/projects/:projectId/recompute', (req, res) => {
  const state = loadDb()
  const exists = state.projects.some((project) => project.id === req.params.projectId)
  if (!exists) return res.status(404).json({ error: 'Project not found' })

  recomputeProjectValidation(req.params.projectId)
  const updatedState = loadDb()
  const count = updatedState.validationDetails.filter((detail) =>
    updatedState.requirements.some(
      (requirement) =>
        requirement.projectId === req.params.projectId &&
        requirement.id === detail.requirementId,
    ),
  ).length

  res.json({
    data: {
      projectId: req.params.projectId,
      validationDetailsCount: count,
      updatedAt: new Date().toISOString(),
    },
  })
})

validationRouter.post('/:requirementId/recompute', (req, res) => {
  const state = loadDb()
  const requirement = state.requirements.find((item) => item.id === req.params.requirementId)
  if (!requirement) return res.status(404).json({ error: 'Requirement not found' })

  recomputeRequirementValidation(req.params.requirementId)
  const payload = buildValidationPayload(req.params.requirementId)
  res.json({
    data: {
      requirementId: req.params.requirementId,
      estimated: payload?.estimated ?? requirement.implementationScore,
      status: payload?.status ?? getValidationStatus(requirement.implementationScore),
      updatedAt: new Date().toISOString(),
    },
  })
})

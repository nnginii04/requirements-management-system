import { Router } from 'express'
import { loadDb } from '../db/store.js'
import {
  calculateEstimatedScore,
  calculateSimilarityAverage,
  getValidationStatus,
} from '../../src/utils/validation.js'
import { enrichMatchesWithSnippets } from '../lib/snippets.js'

export const validationRouter = Router()

validationRouter.get('/:requirementId', (req, res) => {
  const state = loadDb()
  const requirement = state.requirements.find((r) => r.id === req.params.requirementId)
  if (!requirement) return res.status(404).json({ error: 'Requirement not found' })

  let detail = state.validationDetails.find((d) => d.requirementId === req.params.requirementId)
  if (!detail) {
    return res.json({
      data: {
        requirement,
        detail: null,
        estimated: requirement.implementationScore,
        similarityAvg: 0,
        status: getValidationStatus(requirement.implementationScore),
        scoreBreakdown: null,
      },
    })
  }

  detail = {
    ...detail,
    matches: enrichMatchesWithSnippets(detail.matches),
  }

  const estimated = calculateEstimatedScore(detail.matches, detail.acceptanceCriteriaStatus)
  const similarityAvg = calculateSimilarityAverage(detail.matches)

  res.json({
    data: {
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
    },
  })
})

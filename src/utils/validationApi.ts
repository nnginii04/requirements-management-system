import type { Requirement } from '@/types'
import type { ValidationResponse } from '@/api/client'
import { fetchValidation } from '@/api/client'
import { getValidationDetail } from '@/mocks/data/validationDetails'
import {
  calculateEstimatedScore,
  calculateSimilarityAverage,
  getValidationStatus,
} from '@/utils/validation'
import type { ImplementationStatus } from '@/types'

export function getMockValidationResponse(requirement: Requirement): ValidationResponse {
  const detail = getValidationDetail(requirement.id) ?? null
  if (!detail) {
    const estimated = requirement.implementationScore
    return {
      requirement,
      detail: null,
      estimated,
      similarityAvg: 0,
      status: getValidationStatus(estimated),
      scoreBreakdown: null,
    }
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
      note: 'AI 추정치 — mock fallback',
    },
  }
}

export async function loadValidationDetail(
  requirement: Requirement,
  apiConnected: boolean,
): Promise<{ data: ValidationResponse; source: 'api' | 'mock' }> {
  if (apiConnected) {
    try {
      const data = await fetchValidation(requirement.id)
      return { data, source: 'api' }
    } catch {
      return { data: getMockValidationResponse(requirement), source: 'mock' }
    }
  }
  return { data: getMockValidationResponse(requirement), source: 'mock' }
}

export function asImplementationStatus(status: string): ImplementationStatus {
  return status as ImplementationStatus
}

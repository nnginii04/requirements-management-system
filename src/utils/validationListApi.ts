import type { ImplementationStatus, Requirement } from '@/types'
import { fetchValidation, fetchValidationList } from '@/api/client'
import type { ValidationResponse } from '@/api/client'
import type { ValidationSummary } from '@/utils/dashboard'
import { getValidationDetail } from '@/mocks/data/validationDetails'
import {
  calculateEstimatedScore,
  calculateSimilarityAverage,
  getValidationStatus,
} from '@/utils/validation'
import { getRequirementStatusByScore } from '@/utils/requirement'

export interface ValidationListEntry {
  requirementId: string
  title: string
  estimated: number
  status: ImplementationStatus
  similarityAvg: number
  matchedFilesCount: number
  missingLogicCount: number
}

export type ValidationListSource = 'api' | 'fallback_mock'

const priorityRank: Record<Requirement['priority'], number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

function buildMockListEntry(req: Requirement): ValidationListEntry | null {
  const detail = getValidationDetail(req.id)
  if (!detail && req.implementationScore <= 0) return null

  const estimated = detail
    ? calculateEstimatedScore(detail.matches, detail.acceptanceCriteriaStatus)
    : req.implementationScore
  const similarityAvg = detail ? calculateSimilarityAverage(detail.matches) : 0

  return {
    requirementId: req.id,
    title: req.title,
    estimated,
    status: getValidationStatus(estimated),
    similarityAvg,
    matchedFilesCount: detail?.matches.filter((m) => m.score >= 0.4).length ?? 0,
    missingLogicCount: detail?.missingLogic.length ?? 0,
  }
}

function buildMockValidationList(requirements: Requirement[]): ValidationListEntry[] {
  return requirements
    .map(buildMockListEntry)
    .filter((item): item is ValidationListEntry => item !== null)
}

export async function loadValidationList(
  projectId: string,
  requirements: Requirement[],
  apiConnected: boolean,
): Promise<{ items: ValidationListEntry[]; source: ValidationListSource }> {
  if (apiConnected) {
    try {
      const apiItems = await fetchValidationList(projectId)
      return {
        items: apiItems.map((item) => ({
          ...item,
          status: item.status as ImplementationStatus,
        })),
        source: 'api',
      }
    } catch {
      // fallback to mock validationDetails
    }
  }

  return {
    items: buildMockValidationList(requirements),
    source: 'fallback_mock',
  }
}

function pickValidationFocusRequirement(
  requirements: Requirement[],
  items: ValidationListEntry[],
): Requirement | undefined {
  const byId = new Map(requirements.map((requirement) => [requirement.id, requirement]))
  return [...items]
    .map((item) => byId.get(item.requirementId))
    .filter((requirement): requirement is Requirement => Boolean(requirement))
    .sort((a, b) => {
      const priorityGap = priorityRank[a.priority] - priorityRank[b.priority]
      if (priorityGap !== 0) return priorityGap
      return b.implementationScore - a.implementationScore
    })[0]
}

function buildSummaryFromResponse(
  requirement: Requirement,
  response: ValidationResponse,
): ValidationSummary {
  return {
    requirementId: response.requirement.id,
    title: response.requirement.title,
    relatedCode: response.detail?.matches
      .filter((match) => match.score >= 0.4)
      .map((match) => match.displayName)
      .slice(0, 4) ?? [],
    similarityAvg: Math.round(response.similarityAvg * 100) / 100,
    estimatedScore: response.estimated,
    status: getRequirementStatusByScore(response.estimated, requirement.status === 'in_review'),
    validatedAt: response.requirement.updatedAt,
  }
}

function buildMockSummary(
  requirement: Requirement,
): ValidationSummary {
  const detail = getValidationDetail(requirement.id)
  const estimated = detail
    ? calculateEstimatedScore(detail.matches, detail.acceptanceCriteriaStatus)
    : requirement.implementationScore
  const similarityAvg = detail ? calculateSimilarityAverage(detail.matches) : 0

  return {
    requirementId: requirement.id,
    title: requirement.title,
    relatedCode: detail?.matches
      .filter((match) => match.score >= 0.4)
      .map((match) => match.displayName)
      .slice(0, 4) ?? [],
    similarityAvg: Math.round(similarityAvg * 100) / 100,
    estimatedScore: estimated,
    status: getRequirementStatusByScore(estimated, requirement.status === 'in_review'),
    validatedAt: requirement.updatedAt,
  }
}

export async function loadDashboardValidationSummary(
  projectId: string,
  requirements: Requirement[],
  apiConnected: boolean,
): Promise<{ summary: ValidationSummary | null; source: ValidationListSource }> {
  const { items, source } = await loadValidationList(projectId, requirements, apiConnected)
  const targetRequirement = pickValidationFocusRequirement(requirements, items)

  if (!targetRequirement) {
    return { summary: null, source }
  }

  if (source === 'api' && apiConnected) {
    try {
      const response = await fetchValidation(targetRequirement.id)
      return {
        summary: buildSummaryFromResponse(targetRequirement, response),
        source: 'api',
      }
    } catch {
      // fallback below
    }
  }

  return {
    summary: buildMockSummary(targetRequirement),
    source: 'fallback_mock',
  }
}

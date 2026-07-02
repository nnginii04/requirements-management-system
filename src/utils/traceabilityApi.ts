import type { Requirement } from '@/types'
import type { TraceabilityMatrixItem } from '@/api/types'
import {
  fetchProjectTraceabilityMatrix,
  fetchRequirementTraceability,
} from '@/api/client'
import { resolveTraceability } from '@/utils/traceability'
import { getValidationDetail } from '@/mocks/data/validationDetails'

export type TraceabilitySource = 'api' | 'fallback_mock'

function buildFallbackTraceabilityItem(
  requirement: Requirement,
  allRequirements: Requirement[],
): TraceabilityMatrixItem {
  const resolved = resolveTraceability(requirement, allRequirements)
  const detail = getValidationDetail(requirement.id)
  const scores = detail?.matches.map((match) => match.score) ?? []
  const similarityScore =
    scores.length > 0
      ? Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100) / 100
      : 0
  const linkStatus: TraceabilityMatrixItem['linkStatus'] =
    similarityScore >= 0.85 ? 'linked' : similarityScore >= 0.4 ? 'partial' : 'missing'

  return {
    requirementId: requirement.id,
    requirementTitle: requirement.title,
    source: requirement.source ?? resolved.source ?? 'Manual Input',
    linkedDocuments: resolved.documents.map((doc) => doc.title),
    linkedCodeFiles: resolved.codeFiles.map((file) => file.name),
    linkedBuilds: resolved.builds.map((build) => build.label),
    linkedTests: resolved.tests.map((test) => test.label),
    similarityScore,
    linkStatus,
  }
}

export async function loadProjectTraceabilityMatrix(
  projectId: string,
  requirements: Requirement[],
  apiConnected: boolean,
): Promise<{ data: TraceabilityMatrixItem[]; source: TraceabilitySource }> {
  if (apiConnected) {
    try {
      const data = await fetchProjectTraceabilityMatrix(projectId)
      return { data, source: 'api' }
    } catch {
      // fallback
    }
  }

  return {
    data: requirements.map((requirement) => buildFallbackTraceabilityItem(requirement, requirements)),
    source: 'fallback_mock',
  }
}

export async function loadRequirementTraceability(
  requirement: Requirement,
  allRequirements: Requirement[],
  apiConnected: boolean,
): Promise<{ data: TraceabilityMatrixItem; source: TraceabilitySource }> {
  if (apiConnected) {
    try {
      const data = await fetchRequirementTraceability(requirement.id)
      return { data, source: 'api' }
    } catch {
      // fallback
    }
  }

  return {
    data: buildFallbackTraceabilityItem(requirement, allRequirements),
    source: 'fallback_mock',
  }
}

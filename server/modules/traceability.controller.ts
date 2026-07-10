import { Controller, Get, Inject, Param } from '@nestjs/common'
import { StoreService } from '../core/store.service.js'
import { apiError } from '../core/http-error.js'
import type { DbState, TraceabilityRecord } from '../db/store.js'

function computeSimilarityScore(scores: number[]): number {
  if (scores.length === 0) return 0
  return Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100) / 100
}

function buildTraceabilityRecord(
  requirementId: string,
  state: DbState,
): TraceabilityRecord | null {
  const requirement = state.requirements.find((r) => r.id === requirementId)
  if (!requirement) return null

  const detail = state.validationDetails.find((d) => d.requirementId === requirement.id)
  const linkedDocuments = state.documents
    .filter(
      (doc) =>
        doc.projectId === requirement.projectId &&
        doc.sourceRequirements.includes(requirement.id),
    )
    .map((doc) => doc.title)

  const linkedCodeFiles = [
    ...(detail?.matches.filter((m) => m.score >= 0.4).map((m) => m.displayName) ?? []),
    ...requirement.traceabilityLinks
      .filter((link) => link.targetType === 'code')
      .map((link) => link.targetId),
  ].filter((value, index, arr) => arr.indexOf(value) === index)

  const linkedBuilds = [
    ...(detail?.matches.map((m) => `Build #${m.buildNumber}`) ?? []),
    ...state.builds
      .filter(
        (build) =>
          build.projectId === requirement.projectId &&
          build.changedRequirements.includes(requirement.id),
      )
      .map((build) => `Build #${build.buildNumber}`),
  ].filter((value, index, arr) => arr.indexOf(value) === index)

  const linkedTests = [
    ...((detail?.matches.map((m) => m.testCase).filter(Boolean) as string[]) ?? []),
    ...requirement.traceabilityLinks
      .filter((link) => link.targetType === 'test')
      .map((link) => link.targetId),
  ].filter((value, index, arr) => arr.indexOf(value) === index)

  const similarityScore = computeSimilarityScore(detail?.matches.map((m) => m.score) ?? [])
  const linkStatus: TraceabilityRecord['linkStatus'] =
    similarityScore >= 0.85 ? 'linked' : similarityScore >= 0.4 ? 'partial' : 'missing'

  return {
    projectId: requirement.projectId,
    requirementId: requirement.id,
    requirementTitle: requirement.title,
    source: requirement.source ?? 'Manual Input',
    linkedDocuments,
    linkedCodeFiles,
    linkedBuilds,
    linkedTests,
    similarityScore,
    linkStatus,
  }
}

@Controller('traceability')
export class TraceabilityController {
  constructor(@Inject(StoreService) private readonly store: StoreService) {}

  @Get('projects/:projectId/matrix')
  matrix(@Param('projectId') projectId: string) {
    const state = this.store.loadDb()
    const requirements = state.requirements.filter((r) => r.projectId === projectId)
    const matrix = requirements
      .map((requirement) => buildTraceabilityRecord(requirement.id, state))
      .filter((item): item is TraceabilityRecord => item !== null)

    return { data: matrix }
  }

  @Get('requirements/:requirementId')
  forRequirement(@Param('requirementId') requirementId: string) {
    const record = buildTraceabilityRecord(requirementId, this.store.loadDb())
    if (!record) throw apiError(404, 'Requirement not found')
    return { data: record }
  }
}

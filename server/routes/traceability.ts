import { Router } from 'express'
import { loadDb, type DbState, type TraceabilityRecord } from '../db/store.js'

export const traceabilityRouter = Router()

function computeSimilarityScore(scores: number[]): number {
  if (scores.length === 0) return 0
  return Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100) / 100
}

function buildTraceabilityRecord(requirementId: string, state: DbState): TraceabilityRecord | null {
  const requirement = state.requirements.find((r) => r.id === requirementId)
  if (!requirement) return null

  const detail = state.validationDetails.find((d) => d.requirementId === requirement.id)
  const linkedDocuments = state.documents
    .filter((doc) => doc.projectId === requirement.projectId && doc.sourceRequirements.includes(requirement.id))
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
      .filter((build) => build.projectId === requirement.projectId && build.changedRequirements.includes(requirement.id))
      .map((build) => `Build #${build.buildNumber}`),
  ].filter((value, index, arr) => arr.indexOf(value) === index)

  const linkedTests = [
    ...(detail?.matches.map((m) => m.testCase).filter(Boolean) as string[] ?? []),
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

traceabilityRouter.get('/projects/:projectId/matrix', (req, res) => {
  const state = loadDb()
  const requirements = state.requirements.filter((r) => r.projectId === req.params.projectId)
  const matrix = requirements
    .map((requirement) => buildTraceabilityRecord(requirement.id, state))
    .filter((item): item is TraceabilityRecord => item !== null)

  res.json({ data: matrix })
})

traceabilityRouter.get('/requirements/:requirementId', (req, res) => {
  const record = buildTraceabilityRecord(req.params.requirementId, loadDb())
  if (!record) return res.status(404).json({ error: 'Requirement not found' })
  res.json({ data: record })
})

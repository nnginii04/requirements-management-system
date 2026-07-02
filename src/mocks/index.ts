import type {
  AnalysisFinding,
  Baseline,
  BuildHistory,
  CodeFile,
  Document,
  Requirement,
  RequirementVersion,
  SimilarityScore,
} from '@/types'
import { analysisFindings } from './data/analysisFindings'
import { baselines } from './data/baselines'
import { buildHistories } from './data/buildHistories'
import { codeFiles } from './data/codeFiles'
import { documents } from './data/documents'
import { projects, currentProjectId } from './data/projects'
import { requirements } from './data/requirements'
import { requirementVersions } from './data/requirementVersions'
import { similarityScores } from './data/similarityScores'
import { users, currentUser } from './data/users'
import { validationDetails, getValidationDetail } from './data/validationDetails'
import { calculateOverallProgress } from '@/utils/requirement'

// ── Re-exports (raw data) ──────────────────────────────────────────
export {
  projects,
  currentProjectId,
  requirements,
  requirementVersions,
  baselines,
  analysisFindings,
  codeFiles,
  similarityScores,
  buildHistories,
  documents,
  users,
  currentUser,
  validationDetails,
}

// ── Computed project with derived fields ─────────────────────────────
export const currentProject = {
  ...projects[0],
  progress: calculateOverallProgress(
    requirements.filter((r) => r.projectId === currentProjectId),
  ),
  totalRequirements: requirements.filter((r) => r.projectId === currentProjectId).length,
  memberCount: users.length,
}

// ── Selectors (API-ready query layer) ───────────────────────────────

export function getProjectById(id: string) {
  return projects.find((p) => p.id === id)
}

export function getRequirementsByProjectId(projectId: string): Requirement[] {
  return requirements.filter((r) => r.projectId === projectId)
}

export function getRequirementById(id: string): Requirement | undefined {
  return requirements.find((r) => r.id === id)
}

export function getVersionsByRequirementId(requirementId: string): RequirementVersion[] {
  return requirementVersions.filter((v) => v.requirementId === requirementId)
}

export function getBaselineById(id: string): Baseline | undefined {
  return baselines.find((b) => b.id === id)
}

export function getBaselinesByProjectId(projectId: string): Baseline[] {
  const projectReqIds = getRequirementsByProjectId(projectId).map((r) => r.id)
  return baselines.filter((b) => b.requirements.some((id) => projectReqIds.includes(id)))
}

export function getAnalysisFindingsByProjectId(projectId: string): AnalysisFinding[] {
  const projectReqIds = new Set(getRequirementsByProjectId(projectId).map((r) => r.id))
  return analysisFindings.filter((f) =>
    f.requirementIds.some((id) => projectReqIds.has(id)),
  )
}

export function getAnalysisFindingsByRequirementId(requirementId: string): AnalysisFinding[] {
  return analysisFindings.filter((f) => f.requirementIds.includes(requirementId))
}

export function hasReviewIssue(requirementId: string): boolean {
  return getAnalysisFindingsByRequirementId(requirementId).some((f) =>
    ['duplicate', 'conflict', 'omission'].includes(f.type),
  )
}

export function getCodeFileById(id: string): CodeFile | undefined {
  return codeFiles.find((f) => f.id === id)
}

export function getSimilarityScoresByRequirementId(requirementId: string): SimilarityScore[] {
  return similarityScores
    .filter((s) => s.requirementId === requirementId)
    .sort((a, b) => b.score - a.score)
}

export function getSimilarityScoresByCodeFileId(codeFileId: string): SimilarityScore[] {
  return similarityScores.filter((s) => s.codeFileId === codeFileId)
}

export function getBuildHistoriesByProjectId(projectId: string): BuildHistory[] {
  return buildHistories
    .filter((b) => b.projectId === projectId)
    .sort((a, b) => b.buildNumber - a.buildNumber)
}

export function getDocumentsByProjectId(projectId: string): Document[] {
  return documents.filter((d) => d.projectId === projectId)
}

export function getUserById(id: string) {
  return users.find((u) => u.id === id)
}

export function getTopSimilarityMatches(limit = 5) {
  return [...similarityScores]
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((score) => ({
      ...score,
      codeFile: getCodeFileById(score.codeFileId),
      requirement: getRequirementById(score.requirementId),
    }))
}

export { getValidationDetail }

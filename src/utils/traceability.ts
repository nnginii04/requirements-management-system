import type { Requirement } from '@/types'
import {
  getBaselineById,
  getBuildHistoriesByProjectId,
  getCodeFileById,
  getDocumentsByProjectId,
  getSimilarityScoresByRequirementId,
} from '@/mocks'

export interface ResolvedTraceability {
  source: string
  documents: { id: string; title: string }[]
  codeFiles: { id: string; name: string; path: string }[]
  builds: { id: string; label: string }[]
  tests: { id: string; label: string }[]
  linkedRequirements: { id: string; title: string; relationship: string }[]
}

const defaultSources: Record<string, string> = {
  'REQ-001': '회의록 2026-06-23',
  'REQ-002': '회의록 2026-06-23',
  'REQ-003': 'PRD v1.2',
  'REQ-004': '이메일 요청 2026-05-10',
  'REQ-005': 'BRS v1.0',
  'REQ-006': '보안 리뷰 2026-06-15',
  'REQ-007': '회의록 2026-06-28',
  'REQ-008': '회의록 2026-07-01',
  'REQ-009': '관리자 요청 2026-05-15',
  'REQ-010': 'AI 분석 도출 2026-06-30',
}

const testLabels: Record<string, string> = {
  'TC-001': 'Login API Test',
  'TC-002': 'Signup Validation Test',
  'TC-005': 'API Response Time Test',
}

export function resolveTraceability(
  requirement: Requirement,
  allRequirements: Requirement[],
): ResolvedTraceability {
  const docs = getDocumentsByProjectId(requirement.projectId).filter((d) =>
    d.sourceRequirements.includes(requirement.id),
  )

  const scores = getSimilarityScoresByRequirementId(requirement.id)
  const codeFromScores = scores.map((s) => {
    const file = getCodeFileById(s.codeFileId)
    return file
      ? { id: file.id, name: file.classes[0] ?? file.fileName, path: file.path }
      : null
  }).filter(Boolean) as { id: string; name: string; path: string }[]

  const codeFromLinks = requirement.traceabilityLinks
    .filter((l) => l.targetType === 'code')
    .map((l) => {
      const file = getCodeFileById(l.targetId)
      return file
        ? { id: file.id, name: file.classes[0] ?? file.fileName, path: file.path }
        : null
    })
    .filter(Boolean) as { id: string; name: string; path: string }[]

  const codeFiles = [...codeFromScores, ...codeFromLinks].filter(
    (f, i, arr) => arr.findIndex((x) => x.id === f.id) === i,
  )

  const builds = getBuildHistoriesByProjectId(requirement.projectId)
    .slice(0, 2)
    .map((b) => ({ id: b.id, label: `Build #${b.buildNumber}` }))

  const tests = requirement.traceabilityLinks
    .filter((l) => l.targetType === 'test')
    .map((l) => ({ id: l.targetId, label: testLabels[l.targetId] ?? l.targetId }))

  const linkedRequirements = requirement.traceabilityLinks
    .filter((l) => l.targetType === 'requirement')
    .map((l) => {
      const req = allRequirements.find((r) => r.id === l.targetId)
      return req
        ? { id: req.id, title: req.title, relationship: l.relationship }
        : null
    })
    .filter(Boolean) as { id: string; title: string; relationship: string }[]

  const baseline = requirement.baseline ? getBaselineById(requirement.baseline) : null

  return {
    source: requirement.source ?? defaultSources[requirement.id] ?? '—',
    documents: docs.map((d) => ({ id: d.id, title: d.title })),
    codeFiles,
    builds,
    tests,
    linkedRequirements,
  }
}

export function getBaselineLabel(baselineId: string | null): string {
  if (!baselineId) return '—'
  const baseline = getBaselineById(baselineId)
  return baseline ? `${baseline.name} v${baseline.version}` : baselineId
}

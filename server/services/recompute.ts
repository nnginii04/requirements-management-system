import { mutate, loadDb, type DbState, type TraceabilityRecord } from '../db/store.js'
import type { AnalysisFinding, Requirement } from '../../src/types/domain.js'
import type {
  AcceptanceCriterionStatus,
  CodeMatchDetail,
  RequirementValidationDetail,
} from '../../src/utils/validation.js'
import {
  calculateEstimatedScore,
  calculateSimilarityAverage,
} from '../../src/utils/validation.js'
import { codeFiles } from '../../src/mocks/data/codeFiles.js'
import { similarityScores } from '../../src/mocks/data/similarityScores.js'

const TEST_LABELS: Record<string, string> = {
  'TC-001': 'Login API Test',
  'TC-002': 'Signup Validation Test',
  'TC-003': 'Dashboard Load Test',
  'TC-005': 'API Response Time Test',
}

const DEFAULT_SOURCE = 'Manual Input'

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

function overlapScore(a: string, b: string): number {
  const aTokens = new Set(tokenize(a))
  const bTokens = new Set(tokenize(b))
  if (aTokens.size === 0 || bTokens.size === 0) return 0
  let overlap = 0
  aTokens.forEach((token) => {
    if (bTokens.has(token)) overlap += 1
  })
  return overlap / Math.max(aTokens.size, bTokens.size)
}

function requirementText(requirement: Requirement): string {
  return [requirement.title, requirement.description, ...requirement.acceptanceCriteria].join(' ')
}

function computeSimilarity(requirement: Requirement, codeFileId: string): number {
  const seeded = similarityScores.find(
    (score) => score.requirementId === requirement.id && score.codeFileId === codeFileId,
  )
  if (seeded) return seeded.score

  const file = codeFiles.find((item) => item.id === codeFileId)
  if (!file) return 0
  const fileText = [file.fileName, file.path, file.module, ...file.classes, ...file.functions].join(' ')
  return Math.min(0.95, Math.round(overlapScore(requirementText(requirement), fileText) * 100) / 100)
}

function latestBuildForRequirement(state: DbState, requirement: Requirement) {
  return (
    state.builds
      .filter((build) => build.projectId === requirement.projectId)
      .sort((a, b) => b.buildNumber - a.buildNumber)[0] ?? null
  )
}

function buildMatches(state: DbState, requirement: Requirement): CodeMatchDetail[] {
  const build = latestBuildForRequirement(state, requirement)
  const linkedTests = requirement.traceabilityLinks
    .filter((link) => link.targetType === 'test')
    .map((link) => TEST_LABELS[link.targetId] ?? link.targetId)

  return codeFiles
    .map((file) => {
      const score = computeSimilarity(requirement, file.id)
      return {
        codeFileId: file.id,
        displayName: file.fileName,
        path: file.path,
        score,
        buildNumber: build?.buildNumber ?? 0,
        commitId: build?.commitId ?? 'local-dev',
        testCase: linkedTests[0],
        status: score >= 0.85 ? 'linked' : score >= 0.4 ? 'partial' : 'missing',
        reason:
          score >= 0.85
            ? `${file.fileName}이(가) 요구사항 핵심 흐름과 직접 매칭됩니다.`
            : score >= 0.4
              ? `${file.fileName}이(가) 일부 흐름과 부분적으로 연결됩니다.`
              : `${file.fileName}과 요구사항의 직접 연관도가 낮습니다.`,
        classes: file.classes,
        functions: file.functions.slice(0, 4).map((name) => ({
          name,
          score: Math.max(0.2, Math.min(0.98, score - 0.06)),
        })),
      } satisfies CodeMatchDetail
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
}

function buildAcceptanceCriteriaStatus(
  requirement: Requirement,
  matches: CodeMatchDetail[],
): AcceptanceCriterionStatus[] {
  const topAvg = calculateSimilarityAverage(matches)
  return requirement.acceptanceCriteria.map((criterion) => {
    const criterionScore = Math.max(
      0,
      Math.min(
        100,
        Math.round((topAvg * 100 + overlapScore(criterion, requirementText(requirement)) * 100) / 2),
      ),
    )
    return {
      criterion,
      score: criterionScore,
      implemented: criterionScore >= 70,
    }
  })
}

function buildMissingLogic(
  requirement: Requirement,
  acceptanceCriteriaStatus: AcceptanceCriterionStatus[],
  matches: CodeMatchDetail[],
): string[] {
  const missing = acceptanceCriteriaStatus
    .filter((criterion) => !criterion.implemented)
    .map((criterion) => `${criterion.criterion} 관련 로직 보강 필요`)

  const text = requirementText(requirement)
  if (text.includes('예외') && !matches.some((match) => match.reason.includes('예외'))) {
    missing.push('예외 처리 흐름이 검증 결과에서 충분히 확인되지 않았습니다.')
  }
  if (text.includes('테스트') && !requirement.traceabilityLinks.some((link) => link.targetType === 'test')) {
    missing.push('테스트 케이스 추적성 링크가 부족합니다.')
  }
  if (text.includes('비밀번호 재설정') && !matches.some((match) => match.displayName.includes('PasswordReset'))) {
    missing.push('비밀번호 재설정 관련 서비스 연동이 부족합니다.')
  }

  return [...new Set(missing)].slice(0, 4)
}

function buildAiExplanation(
  requirement: Requirement,
  estimated: number,
  similarityAvg: number,
  missingLogic: string[],
): string {
  return [
    `${requirement.id} 재검증 결과 추정 구현 점수는 ${estimated}%입니다.`,
    `Top-K 코드 유사도 평균은 ${similarityAvg.toFixed(2)}이며 수용 기준 기반 점검을 함께 반영했습니다.`,
    missingLogic.length > 0
      ? `보강이 필요한 항목: ${missingLogic.join(' / ')}`
      : '현재 기준에서 주요 누락 로직은 탐지되지 않았습니다.',
  ].join(' ')
}

function buildValidationDetail(
  state: DbState,
  requirement: Requirement,
): RequirementValidationDetail {
  const matches = buildMatches(state, requirement)
  const acceptanceCriteriaStatus = buildAcceptanceCriteriaStatus(requirement, matches)
  const missingLogic = buildMissingLogic(requirement, acceptanceCriteriaStatus, matches)
  const estimated = calculateEstimatedScore(matches, acceptanceCriteriaStatus)
  const similarityAvg = calculateSimilarityAverage(matches)
  const build = latestBuildForRequirement(state, requirement)

  return {
    requirementId: requirement.id,
    matches,
    missingLogic,
    aiExplanation: buildAiExplanation(requirement, estimated, similarityAvg, missingLogic),
    acceptanceCriteriaStatus,
    buildVerification: {
      buildNumber: build?.buildNumber ?? 0,
      status: estimated >= 90 ? 'verified' : estimated >= 70 ? 'partial' : 'failed',
      scoreAtBuild: estimated,
      commitId: build?.commitId ?? 'local-dev',
      commitMessage: build?.commitMessage ?? 'Local recompute',
    },
  }
}

function buildTraceabilityRecord(state: DbState, requirement: Requirement): TraceabilityRecord {
  const detail = state.validationDetails.find((item) => item.requirementId === requirement.id)
  const linkedDocuments = state.documents
    .filter((doc) => doc.projectId === requirement.projectId && doc.sourceRequirements.includes(requirement.id))
    .map((doc) => doc.title)
  const linkedCodeFiles = [
    ...(detail?.matches.filter((match) => match.score >= 0.4).map((match) => match.displayName) ?? []),
    ...requirement.traceabilityLinks
      .filter((link) => link.targetType === 'code')
      .map((link) => link.targetId),
  ].filter((value, index, arr) => arr.indexOf(value) === index)
  const linkedBuilds = [
    ...(detail?.matches.map((match) => `Build #${match.buildNumber}`) ?? []),
    ...state.builds
      .filter(
        (build) =>
          build.projectId === requirement.projectId &&
          (build.changedRequirements.includes(requirement.id) ||
            build.failedRequirements.includes(requirement.id)),
      )
      .map((build) => `Build #${build.buildNumber}`),
  ].filter((value, index, arr) => arr.indexOf(value) === index)
  const linkedTests = [
    ...(detail?.matches.map((match) => match.testCase).filter(Boolean) as string[] ?? []),
    ...requirement.traceabilityLinks
      .filter((link) => link.targetType === 'test')
      .map((link) => TEST_LABELS[link.targetId] ?? link.targetId),
  ].filter((value, index, arr) => arr.indexOf(value) === index)
  const similarityScore = calculateSimilarityAverage(detail?.matches ?? [])
  const linkStatus: TraceabilityRecord['linkStatus'] =
    similarityScore >= 0.85 ? 'linked' : similarityScore >= 0.4 ? 'partial' : 'missing'

  return {
    projectId: requirement.projectId,
    requirementId: requirement.id,
    requirementTitle: requirement.title,
    source: requirement.source ?? DEFAULT_SOURCE,
    linkedDocuments,
    linkedCodeFiles,
    linkedBuilds,
    linkedTests,
    similarityScore,
    linkStatus,
  }
}

function syncTraceabilityRecords(state: DbState, projectId: string) {
  const requirements = state.requirements.filter((requirement) => requirement.projectId === projectId)
  state.traceabilityRecords = [
    ...state.traceabilityRecords.filter((record) => record.projectId !== projectId),
    ...requirements.map((requirement) => buildTraceabilityRecord(state, requirement)),
  ]
}

function tokensContainAll(text: string, keywords: string[]) {
  const lower = text.toLowerCase()
  return keywords.every((keyword) => lower.includes(keyword))
}

function buildAnalysisFindings(state: DbState, projectId: string): AnalysisFinding[] {
  const requirements = state.requirements.filter((requirement) => requirement.projectId === projectId)
  const findings: AnalysisFinding[] = []
  let counter = 1
  const nextId = () => `AF-RC-${Date.now()}-${counter++}`

  for (let index = 0; index < requirements.length; index += 1) {
    for (let inner = index + 1; inner < requirements.length; inner += 1) {
      const left = requirements[index]
      const right = requirements[inner]
      const sim = overlapScore(requirementText(left), requirementText(right))
      if (sim >= 0.55) {
        findings.push({
          id: nextId(),
          type: 'duplicate',
          requirementIds: [left.id, right.id],
          description: `${left.id}와 ${right.id}가 기능 설명과 수용 기준에서 높은 중복도를 보입니다.`,
          severity: sim >= 0.8 ? 'high' : 'medium',
          confidence: Math.min(0.97, Math.max(0.65, sim)),
          suggestedAction: `${right.id}를 ${left.id}에 병합하거나 중복 범위를 조정하세요.`,
          aiExplanation: `제목/설명 유사도 ${sim.toFixed(2)}로 중복 후보로 분류했습니다.`,
          similarityScore: Math.round(sim * 100) / 100,
        })
      }

      const pairText = `${requirementText(left)} ${requirementText(right)}`.toLowerCase()
      const conflict =
        (pairText.includes('자동 로그인') && pairText.includes('재인증')) ||
        (pairText.includes('무제한') && pairText.includes('타임아웃')) ||
        (pairText.includes('권한') && pairText.includes('공개')) ||
        (pairText.includes('보안') && pairText.includes('자동 로그인'))
      if (conflict) {
        findings.push({
          id: nextId(),
          type: 'conflict',
          requirementIds: [left.id, right.id],
          description: `${left.id}와 ${right.id}가 보안/세션/권한 정책에서 상충 가능성이 있습니다.`,
          severity: 'high',
          confidence: 0.84,
          suggestedAction: '정책 우선순위를 명확히 하고 상충 조건을 정리하세요.',
          aiExplanation: '보안, 자동 로그인, 세션, 권한 관련 키워드 조합을 기준으로 충돌 후보를 생성했습니다.',
        })
      }
    }
  }

  const authFlowKeywords = ['로그인', '회원가입', '비밀번호 재설정', '예외 처리', '테스트 케이스']
  const existingText = requirements.map(requirementText).join(' ')
  authFlowKeywords.forEach((keyword) => {
    if (!existingText.includes(keyword)) {
      const target = requirements[0]
      if (!target) return
      findings.push({
        id: nextId(),
        type: 'omission',
        requirementIds: [target.id],
        description: `${keyword} 관련 흐름이 현재 요구사항 집합에서 누락될 가능성이 있습니다.`,
        severity: 'medium',
        confidence: 0.76,
        suggestedAction: `${keyword} 관련 요구사항 또는 수용 기준을 추가하세요.`,
        aiExplanation: `${keyword} 키워드가 프로젝트 요구사항 전체에서 충분히 관찰되지 않아 누락 후보로 분류했습니다.`,
      })
    }
  })

  requirements.forEach((requirement) => {
    const traceabilityRecord = state.traceabilityRecords.find((record) => record.requirementId === requirement.id)
    const missingTraceability =
      !traceabilityRecord ||
      traceabilityRecord.linkedCodeFiles.length === 0 ||
      traceabilityRecord.linkedTests.length === 0
    if (missingTraceability) {
      findings.push({
        id: nextId(),
        type: 'traceability_gap',
        requirementIds: [requirement.id],
        description: `${requirement.id}는 코드/테스트 추적성 링크가 부족합니다.`,
        severity: 'medium',
        confidence: 0.79,
        suggestedAction: '코드 파일 및 테스트 케이스 링크를 보강하세요.',
        aiExplanation: '추적성 링크 수와 validation 결과를 기준으로 갭을 계산했습니다.',
      })
    }
  })

  return findings
}

export function recomputeRequirementValidation(requirementId: string) {
  return mutate((state) => {
    const requirement = state.requirements.find((item) => item.id === requirementId)
    if (!requirement) return

    const detail = buildValidationDetail(state, requirement)
    const index = state.validationDetails.findIndex((item) => item.requirementId === requirementId)
    if (index >= 0) state.validationDetails[index] = detail
    else state.validationDetails.push(detail)

    requirement.implementationScore = calculateEstimatedScore(detail.matches, detail.acceptanceCriteriaStatus)
    syncTraceabilityRecords(state, requirement.projectId)
  })
}

export function recomputeProjectValidation(projectId: string) {
  return mutate((state) => {
    const requirements = state.requirements.filter((item) => item.projectId === projectId)
    requirements.forEach((requirement) => {
      const detail = buildValidationDetail(state, requirement)
      const index = state.validationDetails.findIndex(
        (item) => item.requirementId === requirement.id,
      )
      if (index >= 0) state.validationDetails[index] = detail
      else state.validationDetails.push(detail)
      requirement.implementationScore = calculateEstimatedScore(
        detail.matches,
        detail.acceptanceCriteriaStatus,
      )
    })
    syncTraceabilityRecords(state, projectId)
  })
}

export function recomputeProjectAnalysis(projectId: string) {
  return mutate((state) => {
    syncTraceabilityRecords(state, projectId)
    const findings = buildAnalysisFindings(state, projectId)
    state.analysisFindings = [
      ...state.analysisFindings.filter((finding) =>
        !finding.requirementIds.some((requirementId) =>
          state.requirements.some(
            (requirement) =>
              requirement.projectId === projectId && requirement.id === requirementId,
          ),
        ),
      ),
      ...findings,
    ]
  })
}

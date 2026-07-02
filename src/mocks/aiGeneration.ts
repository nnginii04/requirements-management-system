import type {
  Requirement,
  RequirementPriority,
  RequirementType,
  RequirementWorkflowStatus,
} from '@/types'

export interface AIGeneratedRequirement {
  tempId: string
  title: string
  description: string
  type: RequirementType
  priority: RequirementPriority
  acceptanceCriteria: string[]
  duplicateRisk?: string
  priorityReason?: string
}

const DEMO_OUTPUT: AIGeneratedRequirement[] = [
  {
    tempId: 'AI-001',
    title: '사용자 로그인 기능',
    description: '사용자는 이메일과 비밀번호를 입력하여 시스템에 로그인할 수 있어야 한다.',
    type: 'functional',
    priority: 'high',
    acceptanceCriteria: [
      '이메일과 비밀번호 입력 필드 제공',
      '올바른 정보 입력 시 JWT 토큰 발급',
      '잘못된 정보 입력 시 오류 메시지 표시',
    ],
    duplicateRisk: 'REQ-001 로그인 기능과 유사',
    priorityReason: '인증은 핵심 사용자 플로우',
  },
  {
    tempId: 'AI-002',
    title: '개인 대시보드 조회 기능',
    description: '로그인한 사용자는 개인화된 대시보드에서 주요 정보를 확인할 수 있어야 한다.',
    type: 'functional',
    priority: 'high',
    acceptanceCriteria: [
      '로그인 후 대시보드 페이지로 리다이렉트',
      '사용자별 맞춤 위젯 표시',
      '최근 활동 요약 제공',
    ],
    duplicateRisk: 'REQ-003 대시보드 조회와 중복 가능',
    priorityReason: '로그인 후 핵심 화면',
  },
  {
    tempId: 'AI-003',
    title: '응답 속도 3초 이내',
    description: '주요 API 및 대시보드 로딩은 3초 이내에 완료되어야 한다.',
    type: 'non_functional',
    priority: 'medium',
    acceptanceCriteria: [
      'P95 응답 시간 3초 이하',
      '대시보드 초기 로딩 3초 이내',
      '성능 저하 시 모니터링 알림',
    ],
    duplicateRisk: 'REQ-005 NFR과 유사',
    priorityReason: '사용자 경험에 직접 영향',
  },
]

export async function generateRequirementsFromText(
  _input: string,
): Promise<AIGeneratedRequirement[]> {
  await new Promise((resolve) => setTimeout(resolve, 1500))
  return DEMO_OUTPUT
}

export function createRequirementFromForm(data: {
  title: string
  description: string
  type: RequirementType
  priority: RequirementPriority
  owner: string
  dueDate: string
  source: string
  acceptanceCriteria: string[]
  relatedFeature?: string
  tags?: string[]
  projectId: string
  existingCount: number
}): Requirement {
  const now = new Date().toISOString()
  const id = `REQ-${String(data.existingCount + 1).padStart(3, '0')}`

  return {
    id,
    projectId: data.projectId,
    title: data.title,
    description: data.description,
    type: data.type,
    priority: data.priority,
    status: 'draft' as RequirementWorkflowStatus,
    owner: data.owner,
    createdAt: now,
    updatedAt: now,
    dueDate: data.dueDate,
    version: '1.0',
    baseline: null,
    acceptanceCriteria: data.acceptanceCriteria.filter(Boolean),
    implementationScore: 0,
    traceabilityLinks: [],
    source: data.source,
    tags: data.tags,
    relatedFeature: data.relatedFeature,
  }
}

export function createRequirementFromAI(
  ai: AIGeneratedRequirement,
  projectId: string,
  existingCount: number,
  owner: string,
): Requirement {
  const now = new Date().toISOString()
  const id = `REQ-${String(existingCount + 1).padStart(3, '0')}`

  return {
    id,
    projectId,
    title: ai.title,
    description: ai.description,
    type: ai.type,
    priority: ai.priority,
    status: 'draft',
    owner,
    createdAt: now,
    updatedAt: now,
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    version: '1.0',
    baseline: null,
    acceptanceCriteria: ai.acceptanceCriteria,
    implementationScore: 0,
    traceabilityLinks: [],
    source: 'AI 생성',
    tags: ['ai-generated'],
  }
}

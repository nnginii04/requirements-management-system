import type { Requirement } from '@/types'

export type DocumentTabType = 'srs' | 'prd' | 'brs'

export interface DocumentSection {
  id: string
  title: string
  content: string
}

export interface GeneratedDocument {
  type: DocumentTabType
  title: string
  sections: DocumentSection[]
  generatedAt: string
  sourceRequirements: string[]
}

export interface DocumentQualityCheck {
  score: number
  missingSections: string[]
  traceabilityIncluded: boolean
  traceabilityCoverage: number
  suggestions: string[]
}

const SRS_SECTIONS = [
  '시스템 개요',
  '목적',
  '범위',
  '기능 요구사항',
  '비기능 요구사항',
  '시스템 제약사항',
  '외부 인터페이스',
  '데이터 요구사항',
  '수용 기준',
  '추적성 매트릭스',
]

const PRD_SECTIONS = [
  '제품 목표',
  '사용자 문제',
  '대상 사용자',
  '핵심 기능',
  '사용자 시나리오',
  '성공 지표',
  '릴리즈 범위',
]

const BRS_SECTIONS = [
  '비즈니스 목표',
  '이해관계자',
  '업무 요구사항',
  '기대 효과',
  '프로젝트 범위',
  '제약사항',
  '리스크',
]

function formatReqList(reqs: Requirement[]) {
  return reqs.map((r) => `- **${r.id}** ${r.title} (${r.priority})`).join('\n')
}

function formatAcceptanceCriteria(reqs: Requirement[]) {
  return reqs
    .flatMap((r) => r.acceptanceCriteria.map((c) => `- [${r.id}] ${c}`))
    .join('\n')
}

export async function generateDocument(
  type: DocumentTabType,
  requirements: Requirement[],
  options: { includeTraceability: boolean; includeNfr: boolean },
): Promise<GeneratedDocument> {
  await new Promise((r) => setTimeout(r, 1200))

  const functional = requirements.filter((r) => r.type === 'functional')
  const nfr = requirements.filter((r) => r.type === 'non_functional')
  const ids = requirements.map((r) => r.id)

  if (type === 'srs') {
    return {
      type,
      title: 'Software Requirements Specification',
      generatedAt: new Date().toISOString(),
      sourceRequirements: ids,
      sections: [
        { id: 'overview', title: '시스템 개요', content: 'Enterprise User Portal은 기업용 통합 인증 및 대시보드 플랫폼입니다. 사용자 인증, 개인화 대시보드, 보안 정책 준수를 핵심으로 합니다.' },
        { id: 'purpose', title: '목적', content: '본 문서는 시스템의 기능·비기능 요구사항을 명확히 정의하여 개발·검증·추적성 관리의 기준을 제공합니다.' },
        { id: 'scope', title: '범위', content: `포함: ${functional.length}개 기능 요구사항, ${nfr.length}개 비기능 요구사항.\n제외: 레거시 시스템 마이그레이션, 모바일 네이티브 앱.` },
        { id: 'functional', title: '기능 요구사항', content: formatReqList(functional) },
        { id: 'nfr', title: '비기능 요구사항', content: options.includeNfr ? formatReqList(nfr) : '_비기능 요구사항 미포함_' },
        { id: 'constraints', title: '시스템 제약사항', content: '- HTTPS 필수\n- JWT 기반 인증\n- 응답 시간 SLA 3초 이내\n- OWASP Top 10 준수' },
        { id: 'interfaces', title: '외부 인터페이스', content: '- 이메일 서비스 (비밀번호 재설정)\n- OAuth2 (Google, Microsoft)\n- Jenkins CI/CD\n- Git SCM' },
        { id: 'data', title: '데이터 요구사항', content: '- 사용자 계정 (이메일, 해시된 비밀번호)\n- 세션/Refresh Token\n- 감사 로그 (append-only)\n- 대시보드 위젯 설정' },
        { id: 'acceptance', title: '수용 기준', content: formatAcceptanceCriteria(requirements) },
        {
          id: 'traceability',
          title: '추적성 매트릭스',
          content: options.includeTraceability
            ? requirements.map((r) => `| ${r.id} | ${r.title} | Code ✓ | Test ${r.traceabilityLinks.some((l) => l.targetType === 'test') ? '✓' : '—'} |`).join('\n')
            : '_추적성 매트릭스 미포함 — 생성 옵션에서 활성화하세요._',
        },
      ],
    }
  }

  if (type === 'prd') {
    return {
      type,
      title: 'Product Requirements Document',
      generatedAt: new Date().toISOString(),
      sourceRequirements: ids,
      sections: [
        { id: 'goals', title: '제품 목표', content: '엔터프라이즈 사용자에게 안전하고 빠른 통합 인증·대시보드 경험을 제공합니다.' },
        { id: 'problems', title: '사용자 문제', content: '- 분산된 인증 시스템으로 인한 로그인 피로\n- 대시보드 로딩 지연\n- 보안 정책 미준수 리스크' },
        { id: 'users', title: '대상 사용자', content: '- 일반 직원 (Employee)\n- 관리자 (Admin)\n- Requirements Engineer\n- Security Architect' },
        { id: 'features', title: '핵심 기능', content: formatReqList(functional.slice(0, 5)) },
        { id: 'scenarios', title: '사용자 시나리오', content: '1. 신규 사용자가 회원가입 후 로그인하여 대시보드를 확인한다.\n2. 사용자가 Remember Me로 재방문 시 자동 로그인된다.\n3. 비밀번호 분실 시 이메일로 재설정한다.' },
        { id: 'metrics', title: '성공 지표', content: '- 로그인 성공률 99.5%\n- 대시보드 P95 로딩 3초 이내\n- 보안 취약점 Critical 0건\n- 요구사항 구현률 80%+' },
        { id: 'release', title: '릴리즈 범위', content: `v1.0: ${ids.slice(0, 6).join(', ')}\nv1.1: ${ids.slice(6).join(', ') || 'TBD'}` },
      ],
    }
  }

  return {
    type: 'brs',
    title: 'Business Requirements Specification',
    generatedAt: new Date().toISOString(),
    sourceRequirements: ids,
    sections: [
      { id: 'biz-goals', title: '비즈니스 목표', content: '- 사용자 온보딩 프로세스 자동화\n- SOC2 컴플라이언스 달성\n- 운영 비용 20% 절감' },
      { id: 'stakeholders', title: '이해관계자', content: '- 제품 오너 (Product Owner)\n- 개발팀 (Engineering)\n- 보안팀 (Security)\n- QA팀\n- 최종 사용자' },
      { id: 'business-req', title: '업무 요구사항', content: formatReqList(requirements) },
      { id: 'benefits', title: '기대 효과', content: '- 인증 관련 헬프데스크 티켓 40% 감소\n- 규제 감사 대응 시간 50% 단축\n- 신규 기능 출시 주기 단축' },
      { id: 'scope', title: '프로젝트 범위', content: 'Enterprise User Portal 인증·대시보드·보안 모듈. 2026 Q2-Q3 릴리즈.' },
      { id: 'constraints', title: '제약사항', content: '- 기존 LDAP 연동 유지\n- 예산 내 인프라 사용\n- 6개월 내 MVP 출시' },
      { id: 'risks', title: '리스크', content: '- REQ-009 보안 정책 충돌\n- 감사 로그 미구현 시 컴플라이언스 리스크\n- 이메일 서비스 연동 지연' },
    ],
  }
}

export function runQualityCheck(
  doc: GeneratedDocument | null,
  type: DocumentTabType,
): DocumentQualityCheck {
  const expectedSections =
    type === 'srs' ? SRS_SECTIONS : type === 'prd' ? PRD_SECTIONS : BRS_SECTIONS

  if (!doc) {
    return {
      score: 0,
      missingSections: expectedSections,
      traceabilityIncluded: false,
      traceabilityCoverage: 0,
      suggestions: ['문서를 먼저 생성하세요.'],
    }
  }

  const presentTitles = doc.sections.map((s) => s.title)
  const missing = expectedSections.filter((s) => !presentTitles.includes(s))
  const traceSection = doc.sections.find((s) => s.title.includes('추적성'))
  const traceabilityIncluded = Boolean(traceSection && !traceSection.content.includes('미포함'))

  const score = Math.round(((expectedSections.length - missing.length) / expectedSections.length) * 100)

  return {
    score,
    missingSections: missing,
    traceabilityIncluded,
    traceabilityCoverage: traceabilityIncluded ? 85 : 0,
    suggestions: [
      ...(missing.length > 0 ? [`누락 섹션: ${missing.join(', ')}`] : []),
      ...(!traceabilityIncluded && type === 'srs' ? ['추적성 매트릭스를 포함하세요.'] : []),
      ...(score < 80 ? ['일부 섹션 내용을 보강하세요.'] : ['문서 품질이 양호합니다.']),
    ],
  }
}

export async function regenerateSection(
  doc: GeneratedDocument,
  sectionId: string,
): Promise<DocumentSection> {
  await new Promise((r) => setTimeout(r, 800))
  const section = doc.sections.find((s) => s.id === sectionId)
  if (!section) throw new Error('Section not found')
  return {
    ...section,
    content: `${section.content}\n\n_[AI 재생성 ${new Date().toLocaleTimeString('ko-KR')}] 내용이 업데이트되었습니다._`,
  }
}

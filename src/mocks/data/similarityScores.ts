import type { SimilarityScore } from '@/types'

export const similarityScores: SimilarityScore[] = [
  {
    requirementId: 'REQ-001',
    codeFileId: 'CF-001',
    score: 0.96,
    reason: 'authenticate, createSession 함수가 로그인 요구사항의 핵심 흐름과 높은 의미적 유사도',
  },
  {
    requirementId: 'REQ-002',
    codeFileId: 'CF-002',
    score: 0.91,
    reason: 'register, validateEmail, checkPasswordStrength 함수가 회원가입 요구사항과 직접 매칭',
  },
  {
    requirementId: 'REQ-003',
    codeFileId: 'CF-004',
    score: 0.84,
    reason: 'DashboardPage 컴포넌트가 대시보드 조회 요구사항의 UI 레이어를 구현',
  },
  {
    requirementId: 'REQ-004',
    codeFileId: 'CF-005',
    score: 0.58,
    reason: 'requestReset, updatePassword는 구현되었으나 이메일 발송 연동 미완료',
  },
  {
    requirementId: 'REQ-005',
    codeFileId: 'CF-008',
    score: 0.73,
    reason: 'PerformanceMonitor가 SLA 추적을 담당하나 대시보드 로딩 측정 미포함',
  },
  {
    requirementId: 'REQ-005',
    codeFileId: 'CF-004',
    score: 0.68,
    reason: '대시보드 렌더링 성능이 3초 SLA에 부분적으로 기여',
  },
  {
    requirementId: 'REQ-006',
    codeFileId: 'CF-006',
    score: 0.82,
    reason: 'SecurityMiddleware가 HTTPS, CSRF, XSS, 세션 타임아웃 정책 구현',
  },
  {
    requirementId: 'REQ-007',
    codeFileId: 'CF-007',
    score: 0.94,
    reason: 'AutoLoginService의 setRememberMe, refreshToken이 자동 로그인 요구사항과 직접 매칭',
  },
  {
    requirementId: 'REQ-008',
    codeFileId: 'CF-007',
    score: 0.88,
    reason: 'REQ-007과 동일 코드 파일에 매칭 — 중복 요구사항 시그널',
  },
  {
    requirementId: 'REQ-009',
    codeFileId: 'CF-006',
    score: 0.22,
    reason: 'sessionTimeout 함수가 존재하여 무제한 접속 요구사항과 충돌',
  },
  {
    requirementId: 'REQ-010',
    codeFileId: 'CF-003',
    score: 0.35,
    reason: 'AuditLogger 기본 구조만 존재, logPermissionChange 미구현',
  },
]

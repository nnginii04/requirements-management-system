import type { RequirementVersion } from '@/types'

export const requirementVersions: RequirementVersion[] = [
  {
    id: 'RV-001',
    requirementId: 'REQ-001',
    version: '2.1',
    changedBy: 'user-002',
    changedAt: '2026-06-28T14:30:00Z',
    changeSummary: 'OAuth2 소셜 로그인 지원 추가',
    previousContent:
      '사용자는 이메일과 비밀번호를 입력하여 시스템에 로그인할 수 있어야 한다.',
    currentContent:
      '사용자는 이메일/비밀번호 또는 OAuth2(Google, Microsoft)를 통해 로그인할 수 있어야 한다.',
  },
  {
    id: 'RV-002',
    requirementId: 'REQ-001',
    version: '2.0',
    changedBy: 'user-001',
    changedAt: '2026-05-10T11:00:00Z',
    changeSummary: '2FA 인증 요구사항 추가',
    previousContent:
      '사용자는 이메일과 비밀번호를 입력하여 시스템에 로그인할 수 있어야 한다.',
    currentContent:
      '사용자는 이메일과 비밀번호를 입력하여 로그인하고, 관리자 계정은 2FA 인증을 거쳐야 한다.',
  },
  {
    id: 'RV-003',
    requirementId: 'REQ-006',
    version: '2.0',
    changedBy: 'user-004',
    changedAt: '2026-06-26T15:00:00Z',
    changeSummary: '세션 타임아웃 30분으로 변경 (기존 60분)',
    previousContent: '세션 타임아웃 60분 적용',
    currentContent: '세션 타임아웃 30분 적용',
  },
  {
    id: 'RV-004',
    requirementId: 'REQ-004',
    version: '1.0',
    changedBy: 'user-002',
    changedAt: '2026-06-18T09:30:00Z',
    changeSummary: '초기 버전 생성',
    previousContent: '',
    currentContent:
      '사용자는 비밀번호를 잊은 경우 이메일을 통해 재설정 링크를 받고, 새 비밀번호를 설정할 수 있어야 한다.',
  },
  {
    id: 'RV-005',
    requirementId: 'REQ-007',
    version: '1.1',
    changedBy: 'user-002',
    changedAt: '2026-06-27T11:00:00Z',
    changeSummary: 'Refresh Token 저장 방식을 HttpOnly 쿠키로 변경',
    previousContent: 'Refresh Token은 localStorage에 저장',
    currentContent: 'Refresh Token은 HttpOnly 쿠키에 저장',
  },
]

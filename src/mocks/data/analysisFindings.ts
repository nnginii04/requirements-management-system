import type { AnalysisFinding } from '@/types'

export const analysisFindings: AnalysisFinding[] = [
  {
    id: 'AF-001',
    type: 'duplicate',
    requirementIds: ['REQ-007', 'REQ-008'],
    description:
      'REQ-007 "자동 로그인 기능"과 REQ-008 "사용자 인증 상태 유지"는 기능적으로 중복됩니다. 두 요구사항 모두 로그인 유지 기능을 설명합니다.',
    severity: 'high',
    confidence: 0.93,
    similarityScore: 0.91,
    suggestedAction: 'REQ-008을 REQ-007에 병합하고, REQ-008은 deprecated 처리하세요.',
    aiExplanation:
      '임베딩 유사도 0.91로 중복 임계값(0.85)을 초과합니다. Remember Me, Refresh Token, 브라우저 재방문 시 인증 유지 등 핵심 키워드가 87% 이상 겹칩니다.',
  },
  {
    id: 'AF-002',
    type: 'conflict',
    requirementIds: ['REQ-006', 'REQ-009'],
    description:
      'REQ-009 "세션 만료 없이 무제한 접속"이 REQ-006 "보안 정책 준수"의 세션 타임아웃 30분 정책과 충돌 가능합니다.',
    severity: 'critical',
    confidence: 0.87,
    suggestedAction: 'REQ-009를 폐기하거나 보안 정책 예외 조항으로 명시적으로 정의하세요.',
    aiExplanation:
      '보안/세션 정책 키워드가 반대 방향으로 매칭됩니다. "무제한 접속" vs "30분 타임아웃"은 상호 배타적 정책으로 분류되었습니다.',
  },
  {
    id: 'AF-003',
    type: 'omission',
    requirementIds: ['REQ-010'],
    description:
      'Password Reset 예외 처리 및 감사 로그 요구사항이 초기 명세에서 누락되었습니다. SOC2 컴플라이언스상 필수입니다.',
    severity: 'critical',
    confidence: 0.81,
    suggestedAction: 'REQ-010을 공식 요구사항에 편입하고 BL-002 베이스라인에 포함하세요.',
    aiExplanation:
      '인증 기능 흐름(로그인→재설정→감사)에서 감사 로그 단계가 빠져 있습니다. 유사 프로젝트 패턴 대비 누락 확률 81%.',
  },
  {
    id: 'AF-004',
    type: 'ambiguity',
    requirementIds: ['REQ-005'],
    description:
      'REQ-005 "응답 속도 3초 이내"에서 "주요 API" 범위가 모호합니다. 품질 점검 결과 명확화가 필요합니다.',
    severity: 'medium',
    confidence: 0.78,
    suggestedAction: '대상 API 엔드포인트 목록을 acceptance criteria에 명시하세요.',
    aiExplanation:
      '측정 대상이 불명확하여 검증 가능성이 낮습니다. NFR 품질 점수 62/100 — 수용 기준 구체화 권장.',
  },
  {
    id: 'AF-005',
    type: 'gap',
    requirementIds: ['REQ-004'],
    description:
      '비밀번호 재설정(REQ-004)의 이메일 발송 모듈 구현 갭이 탐지되었습니다. UI만 존재하고 백엔드 연동 누락.',
    severity: 'high',
    confidence: 0.85,
    suggestedAction: '이메일 서비스 연동을 Sprint 5에 배정하고 E2E 테스트를 추가하세요.',
    aiExplanation:
      '코드 임베딩 분석 결과 requestReset 함수는 존재하나 sendEmail 연동이 없습니다. 구현 갭 확률 85%.',
  },
  {
    id: 'AF-006',
    type: 'traceability_gap',
    requirementIds: ['REQ-003', 'REQ-005'],
    description:
      'REQ-003 대시보드 조회에 대한 테스트 케이스 추적성 링크가 누락되어 있습니다.',
    severity: 'medium',
    confidence: 0.76,
    suggestedAction: 'TC-003 Dashboard Load Test를 생성하고 추적성 링크를 추가하세요.',
    aiExplanation:
      '기능 요구사항 대비 테스트 커버리지 매트릭스에서 REQ-003 행이 비어 있습니다. E2E 추적성 갭으로 분류.',
  },
  {
    id: 'AF-007',
    type: 'priority',
    requirementIds: ['REQ-010'],
    description:
      'REQ-010 감사 로그 기록의 우선순위를 High → Critical로 상향 추천합니다. 컴플라이언스 리스크.',
    severity: 'high',
    confidence: 0.88,
    suggestedAction: '우선순위를 Critical로 변경하고 Sprint 5 최우선 배정하세요.',
    aiExplanation:
      'SOC2, 감사 로그 키워드와 연관된 규제 요구사항 패턴 매칭. 미구현 시 인증 전체 컴플라이언스 리스크.',
  },
  {
    id: 'AF-008',
    type: 'refinement',
    requirementIds: ['REQ-001'],
    description:
      'REQ-001 로그인 기능 문장 정제 제안: "이메일과 비밀번호" → "등록된 이메일 주소와 유효한 비밀번호"',
    severity: 'low',
    confidence: 0.72,
    suggestedAction: '요구사항 문장을 정제된 버전으로 업데이트하세요.',
    aiExplanation:
      'SMART 요구사항 기준 분석: 측정 가능성·명확성 점수 향상 가능. "등록된", "유효한" 한정어 추가 권장.',
  },
  {
    id: 'AF-009',
    type: 'test_recommendation',
    requirementIds: ['REQ-001', 'REQ-007'],
    description:
      'REQ-001, REQ-007에 대한 통합 로그인/자동 로그인 E2E 테스트 케이스 추가를 추천합니다.',
    severity: 'medium',
    confidence: 0.84,
    suggestedAction: 'Login + Remember Me E2E Test Suite를 테스트 계획에 추가하세요.',
    aiExplanation:
      '인증 핵심 플로우이나 TC-001만 존재. Remember Me 시나리오 테스트 부재. 테스트 필요도 84%.',
  },
  {
    id: 'AF-010',
    type: 'quality',
    requirementIds: ['REQ-002'],
    description:
      'REQ-002 회원가입 기능 수용 기준에 "비밀번호 확인 필드" 항목 추가를 권장합니다.',
    severity: 'low',
    confidence: 0.69,
    suggestedAction: '수용 기준에 비밀번호 확인 입력 및 일치 검증을 추가하세요.',
    aiExplanation:
      '업계 표준 회원가입 UX 패턴 대비 수용 기준 완전성 69%. 비밀번호 재입력 검증이 빠져 있음.',
  },
]

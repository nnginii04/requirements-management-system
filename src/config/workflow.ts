import type { LifecycleStage } from '@/types'

export interface WorkflowConfig {
  stage: LifecycleStage
  title: string
  subtitle: string
  keywords: string[]
  nextStep?: { label: string; path: string }
}

export const routeWorkflow: Record<string, WorkflowConfig> = {
  '/dashboard': {
    stage: 'tracking',
    title: '요구사항 엔지니어링 대시보드',
    subtitle: '요구사항 구현 상태 · AI 분석 · Jenkins 빌드 진척 타임라인',
    keywords: [
      '요구사항 엔지니어링',
      '추정 구현 점수',
      '요구사항 추적성',
      '진척 타임라인',
    ],
    nextStep: { label: '요구사항 관리', path: '/requirements' },
  },
  '/requirements': {
    stage: 'elicitation',
    title: '요구사항 관리',
    subtitle: '요구사항 현황 · 버전 이력 · 베이스라인 · 추적성',
    keywords: [
      '요구사항 관리',
      '버전 이력',
      '베이스라인',
      '요구사항 추적성',
    ],
    nextStep: { label: 'AI 분석', path: '/analysis' },
  },
  '/requirements/new': {
    stage: 'elicitation',
    title: '새 요구사항',
    subtitle: '요구사항 등록 · AI 기반 도출',
    keywords: ['요구사항 엔지니어링', 'AI 분석', '도출'],
    nextStep: { label: '요구사항 목록', path: '/requirements' },
  },
  '/analysis': {
    stage: 'analysis',
    title: 'AI 분석',
    subtitle: '중복 · 충돌 · 누락 탐지 · 품질 점검',
    keywords: ['AI 분석', '요구사항 추적성', '중복 탐지'],
    nextStep: { label: '명세서 생성', path: '/documents' },
  },
  '/documents': {
    stage: 'specification',
    title: '명세서 생성',
    subtitle: 'SRS · PRD · BRS 문서 생성 및 품질 점검',
    keywords: ['명세서 생성', 'SRS', 'PRD', 'BRS', '추적성 매트릭스'],
    nextStep: { label: '구현 검증', path: '/validation' },
  },
  '/validation': {
    stage: 'validation',
    title: '구현 검증',
    subtitle: '요구사항-코드 유사도 · 코드 관계 · 추정 구현 점수',
    keywords: [
      '구현 검증',
      '요구사항-코드 유사도',
      '코드 관계',
      '추정 구현 점수',
      '추적성 매트릭스',
    ],
    nextStep: { label: 'Jenkins 빌드 이력', path: '/build-history' },
  },
  '/build-history': {
    stage: 'tracking',
    title: 'Jenkins 빌드 이력',
    subtitle: '빌드별 추정 진척률 · 진척 타임라인 · 요구사항 스냅샷',
    keywords: ['Jenkins 빌드 이력', '진척 타임라인', '추정 구현 점수'],
    nextStep: { label: '엔지니어링 대시보드', path: '/dashboard' },
  },
  '/settings': {
    stage: 'tracking',
    title: '프로젝트 설정',
    subtitle: '연동 · 베이스라인 · 추적성 설정',
    keywords: ['베이스라인', '요구사항 추적성', 'Jenkins 빌드 이력'],
  },
}

export function getWorkflowForPath(pathname: string): WorkflowConfig {
  if (routeWorkflow[pathname]) return routeWorkflow[pathname]
  if (pathname.startsWith('/requirements')) return routeWorkflow['/requirements']
  return routeWorkflow['/dashboard']
}

export function getLifecycleStageForPath(pathname: string): LifecycleStage {
  return getWorkflowForPath(pathname).stage
}

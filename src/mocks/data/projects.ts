import type { Project } from '@/types'

export const projects: Project[] = [
  {
    id: 'proj-001',
    name: '엔터프라이즈 사용자 포털',
    description:
      '기업용 사용자 인증, 대시보드, 보안 정책을 포함하는 통합 사용자 포털 플랫폼의 요구사항 엔지니어링 프로젝트',
    createdAt: '2026-03-15T09:00:00Z',
    progress: 0,
  },
  {
    id: 'proj-002',
    name: '모바일 앱 v2',
    description: 'iOS/Android 네이티브 앱 요구사항 엔지니어링 프로젝트 (준비 중)',
    createdAt: '2026-05-01T09:00:00Z',
    progress: 0,
  },
]

export const currentProjectId = projects[0].id

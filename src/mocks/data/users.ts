import type { User } from '@/types'

export const users: User[] = [
  {
    id: 'user-001',
    name: '정예진',
    email: 'yejin.jung@company.com',
    role: '요구사항 엔지니어',
    avatarInitials: '정',
  },
  {
    id: 'user-002',
    name: '박민수',
    email: 'minsu.park@company.com',
    role: '백엔드 개발자',
    avatarInitials: '박',
  },
  {
    id: 'user-003',
    name: '이서연',
    email: 'seoyeon.lee@company.com',
    role: 'QA 엔지니어',
    avatarInitials: '이',
  },
  {
    id: 'user-004',
    name: '최준호',
    email: 'junho.choi@company.com',
    role: '보안 아키텍트',
    avatarInitials: '최',
  },
]

export const currentUser = users[0]

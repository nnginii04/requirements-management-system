import type { Baseline } from '@/types'

export const baselines: Baseline[] = [
  {
    id: 'BL-001',
    name: '스프린트 3 베이스라인',
    version: '1.0',
    createdAt: '2026-05-01T00:00:00Z',
    requirements: ['REQ-001', 'REQ-002', 'REQ-003', 'REQ-005', 'REQ-007'],
  },
  {
    id: 'BL-002',
    name: '보안 릴리스 베이스라인',
    version: '2.0',
    createdAt: '2026-06-15T00:00:00Z',
    requirements: ['REQ-001', 'REQ-002', 'REQ-006', 'REQ-010'],
  },
]

import type { LifecycleStage } from '@/types'

export interface LifecycleStep {
  id: LifecycleStage
  label: string
  description: string
}

export const lifecycleSteps: LifecycleStep[] = [
  {
    id: 'elicitation',
    label: '도출',
    description: '요구사항 도출',
  },
  {
    id: 'analysis',
    label: '분석',
    description: '요구사항 분석',
  },
  {
    id: 'specification',
    label: '명세화',
    description: '명세서 작성',
  },
  {
    id: 'validation',
    label: '검증',
    description: '구현 검증',
  },
  {
    id: 'tracking',
    label: '추적',
    description: '진척 추적',
  },
]

export const defaultLifecycleStage: LifecycleStage = 'analysis'

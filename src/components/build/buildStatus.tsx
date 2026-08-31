import { CheckCircle2, XCircle, AlertTriangle, CircleSlash, Minus, TrendingDown, TrendingUp } from 'lucide-react'
import type { BuildStatus, TestResult } from '@/types'

/**
 * 빌드 상태는 색만으로 구분하지 않습니다 — 상태색(success/warning/danger)은
 * 적록색약에서 분리도가 낮아, 항상 아이콘 + 한글 라벨을 함께 렌더합니다.
 */
interface StatusMeta {
  label: string
  Icon: typeof CheckCircle2
  text: string
  dot: string
  chart: string
}

const buildStatusMeta: Record<BuildStatus, StatusMeta> = {
  success: { label: '성공', Icon: CheckCircle2, text: 'text-success', dot: 'bg-success', chart: '#22C55E' },
  failure: { label: '실패', Icon: XCircle, text: 'text-danger', dot: 'bg-danger', chart: '#EF4444' },
  unstable: { label: '불안정', Icon: AlertTriangle, text: 'text-warning', dot: 'bg-warning', chart: '#F59E0B' },
  aborted: { label: '중단', Icon: CircleSlash, text: 'text-text-secondary', dot: 'bg-gray-400', chart: '#9CA3AF' },
}

export function getBuildStatusMeta(status: BuildStatus): StatusMeta {
  return buildStatusMeta[status] ?? buildStatusMeta.aborted
}

const testResultLabels: Record<TestResult, string> = {
  passed: '전체 통과',
  failed: '실패',
  skipped: '건너뜀',
  partial: '일부 통과',
}

export function getTestResultLabel(result: TestResult): string {
  return testResultLabels[result] ?? String(result)
}

/** 아이콘 + 라벨을 함께 내보내는 상태 표시. 색은 보조 신호로만 씁니다. */
export function BuildStatusLabel({ status, className }: { status: BuildStatus; className?: string }) {
  const { label, Icon, text } = getBuildStatusMeta(status)
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${text} ${className ?? ''}`}>
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {label}
    </span>
  )
}

/** 진척 변화량 — 부호와 화살표를 함께 써서 색에만 의존하지 않습니다. */
export function ProgressDelta({ value, className }: { value: number; className?: string }) {
  const rounded = Math.round(value)
  if (rounded === 0) {
    return (
      <span className={`inline-flex items-center gap-1 text-xs text-text-secondary ${className ?? ''}`}>
        <Minus className="h-3 w-3 shrink-0" aria-hidden />
        변화 없음
      </span>
    )
  }
  const up = rounded > 0
  const Icon = up ? TrendingUp : TrendingDown
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${up ? 'text-success' : 'text-danger'} ${className ?? ''}`}
    >
      <Icon className="h-3 w-3 shrink-0" aria-hidden />
      {up ? '+' : ''}
      {rounded}%
    </span>
  )
}

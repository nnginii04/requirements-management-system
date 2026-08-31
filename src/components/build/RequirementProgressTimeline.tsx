import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Badge } from '@/components/ui/Badge'
import { fetchRequirementTimeline } from '@/api/client'
import { requirementBuildSnapshots } from '@/mocks/data/buildHistories'
import type { RequirementBuildSnapshot } from '@/types'
import { ProgressDelta } from './buildStatus'

interface RequirementProgressTimelineProps {
  requirementId: string
  requirementTitle: string
  apiConnected: boolean
}

function mockSnapshots(requirementId: string): RequirementBuildSnapshot[] {
  return requirementBuildSnapshots
    .filter((s) => s.requirementId === requirementId)
    .sort((a, b) => a.buildNumber - b.buildNumber)
}

function SnapshotTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload: { label: string; progress: number; date: string } }[]
}) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-card">
      <p className="font-medium text-text-primary">빌드 {point.label}</p>
      <p className="mt-1 text-text-secondary">추정 구현 점수 ~{point.progress}%</p>
      <p className="text-text-secondary">{point.date}</p>
    </div>
  )
}

export function RequirementProgressTimeline({
  requirementId,
  requirementTitle,
  apiConnected,
}: RequirementProgressTimelineProps) {
  const [snapshots, setSnapshots] = useState<RequirementBuildSnapshot[]>(() =>
    mockSnapshots(requirementId),
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!apiConnected) {
      setSnapshots(mockSnapshots(requirementId))
      return
    }

    let cancelled = false
    setLoading(true)
    fetchRequirementTimeline(requirementId)
      .then((data) => {
        if (cancelled) return
        setSnapshots([...data].sort((a, b) => a.buildNumber - b.buildNumber))
      })
      .catch(() => {
        if (!cancelled) setSnapshots(mockSnapshots(requirementId))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [requirementId, apiConnected])

  const data = snapshots.map((s) => ({
    label: `#${s.buildNumber}`,
    progress: s.progress,
    date: new Date(s.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
  }))

  const first = snapshots[0]
  const last = snapshots[snapshots.length - 1]
  const totalChange = first && last ? last.progress - first.progress : 0

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <SectionHeader
          title={`${requirementId} 구현 점수 추이`}
          description={requirementTitle}
        />
        <div className="flex shrink-0 items-center gap-2">
          {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin text-text-secondary" aria-hidden />}
          <Badge variant="outline">{apiConnected ? 'API' : 'Mock'}</Badge>
        </div>
      </div>

      {data.length === 0 ? (
        <p className="mt-8 text-sm text-text-secondary">
          이 요구사항에 연결된 빌드 스냅샷이 아직 없습니다.
        </p>
      ) : (
        <>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip content={<SnapshotTooltip />} cursor={{ stroke: '#9CA3AF', strokeDasharray: '3 3' }} />
                <Line
                  type="monotone"
                  dataKey="progress"
                  stroke="#0064FF"
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#0064FF', stroke: '#FFFFFF', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#0064FF', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-text-secondary">
            <span>
              빌드 #{first.buildNumber} ~{first.progress}% → #{last.buildNumber} ~{last.progress}%
            </span>
            <ProgressDelta value={totalChange} />
            <span>· 스냅샷 {snapshots.length}건</span>
          </div>
        </>
      )}
    </Card>
  )
}

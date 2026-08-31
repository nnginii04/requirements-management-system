import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  type DotProps,
} from 'recharts'
import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Badge } from '@/components/ui/Badge'
import type { getTimelineData } from '@/utils/buildHistory'
import { getBuildStatusMeta } from './buildStatus'

type TimelinePoint = ReturnType<typeof getTimelineData>[number]

interface BuildTimelineChartProps {
  data: TimelinePoint[]
  selectedBuild: number | null
}

/**
 * 선택된 빌드는 크기 + 표면 링으로 구분하고, 상태는 tooltip 의 텍스트로 읽힙니다.
 * (상태색만으로는 색약에서 구분되지 않으므로 색을 단독 신호로 쓰지 않습니다.)
 */
function TimelineDot({ cx, cy, payload, selectedBuild }: DotProps & { payload?: TimelinePoint; selectedBuild: number | null }) {
  if (cx == null || cy == null || !payload) return null
  const isSelected = payload.buildNumber === selectedBuild
  const { chart } = getBuildStatusMeta(payload.status)
  return (
    <circle
      cx={cx}
      cy={cy}
      r={isSelected ? 6 : 4}
      fill={chart}
      stroke="#FFFFFF"
      strokeWidth={2}
    />
  )
}

function TimelineTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload: TimelinePoint }[]
}) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  const { label } = getBuildStatusMeta(point.status)
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-card">
      <p className="font-medium text-text-primary">빌드 #{point.buildNumber}</p>
      <p className="mt-1 text-text-secondary">추정 진척률 ~{point.progress}%</p>
      <p className="text-text-secondary">상태 {label}</p>
      <p className="text-text-secondary">{point.date}</p>
    </div>
  )
}

export function BuildTimelineChart({ data, selectedBuild }: BuildTimelineChartProps) {
  return (
    <Card className="h-full">
      <div className="flex items-start justify-between gap-3">
        <SectionHeader
          title="빌드별 추정 진척률"
          description="빌드 번호 순 · 코드 스냅샷 기반 추정치"
        />
        <Badge variant="outline" className="shrink-0">{data.length}개 빌드</Badge>
      </div>

      {data.length === 0 ? (
        <p className="mt-8 text-sm text-text-secondary">표시할 빌드가 없습니다.</p>
      ) : (
        <div className="mt-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="buildProgressGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0064FF" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0064FF" stopOpacity={0} />
                </linearGradient>
              </defs>
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
              <Tooltip content={<TimelineTooltip />} cursor={{ stroke: '#9CA3AF', strokeDasharray: '3 3' }} />
              <Area
                type="monotone"
                dataKey="progress"
                stroke="#0064FF"
                strokeWidth={2}
                fill="url(#buildProgressGradient)"
                dot={<TimelineDot selectedBuild={selectedBuild} />}
                activeDot={{ r: 7, fill: '#0064FF', stroke: '#FFFFFF', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}

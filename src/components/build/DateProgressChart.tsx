import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Badge } from '@/components/ui/Badge'
import { ProgressDelta } from './buildStatus'

interface DateProgressPoint {
  date: string
  progress: number
}

interface DateProgressChartProps {
  data: DateProgressPoint[]
}

function DateTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-card">
      <p className="font-medium text-text-primary">{label}</p>
      <p className="mt-1 text-text-secondary">추정 진척률 ~{payload[0].value}%</p>
    </div>
  )
}

export function DateProgressChart({ data }: DateProgressChartProps) {
  const first = data[0]
  const last = data[data.length - 1]
  const totalChange = first && last ? last.progress - first.progress : 0

  return (
    <Card className="h-full">
      <div className="flex items-start justify-between gap-3">
        <SectionHeader title="날짜별 진척 추이" description="같은 날 여러 빌드는 마지막 값 기준" />
        <Badge variant="outline" className="shrink-0">{data.length}개 시점</Badge>
      </div>

      {data.length === 0 ? (
        <p className="mt-8 text-sm text-text-secondary">표시할 데이터가 없습니다.</p>
      ) : (
        <>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis
                  dataKey="date"
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
                <Tooltip content={<DateTooltip />} cursor={{ stroke: '#9CA3AF', strokeDasharray: '3 3' }} />
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
          {first && last && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-text-secondary">
              <span>
                {first.date} ~{first.progress}% → {last.date} ~{last.progress}%
              </span>
              <ProgressDelta value={totalChange} />
            </div>
          )}
        </>
      )}
    </Card>
  )
}

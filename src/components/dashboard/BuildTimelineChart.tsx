import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { DashboardStats } from '@/utils/dashboard'

interface BuildTimelineChartProps {
  stats: DashboardStats
}

export function BuildTimelineChart({ stats }: BuildTimelineChartProps) {
  const data = stats.buildTimeline

  return (
    <Card className="h-full">
      <SectionHeader
        title="빌드 진척 타임라인"
        description="Jenkins 빌드 기반 시점별 추정 진척률"
      />
      <div className="mt-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
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
            <Tooltip
              formatter={(value: number) => [`~${value}%`, '추정 진척률']}
              labelFormatter={(label) => `빌드 ${label}`}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="progress"
              stroke="#0064FF"
              strokeWidth={2}
              fill="url(#progressGradient)"
              dot={{ r: 4, fill: '#0064FF', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#0064FF' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap gap-3">
        {data.map((point) => (
          <span key={point.buildNumber} className="text-[11px] text-text-secondary">
            빌드 {point.label}: <span className="font-medium text-text-primary">~{point.progress}%</span>
          </span>
        ))}
      </div>
    </Card>
  )
}

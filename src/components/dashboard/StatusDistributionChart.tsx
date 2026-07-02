import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { DashboardStats } from '@/utils/dashboard'

interface StatusDistributionChartProps {
  stats: DashboardStats
}

export function StatusDistributionChart({ stats }: StatusDistributionChartProps) {
  const data = stats.statusDistribution

  return (
    <Card className="h-full">
      <SectionHeader
        title="요구사항 상태 분포"
        description="추정 구현 점수 기반 상태 분포"
      />
      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row">
        <div className="h-52 w-full sm:w-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={2}
                dataKey="count"
                nameKey="label"
              >
                {data.map((entry) => (
                  <Cell key={entry.status} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [`${value}개`, name]}
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex w-full flex-1 flex-col gap-2">
          {data.map((item) => (
            <div key={item.status} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-text-secondary">{item.label}</span>
              </div>
              <span className="text-sm font-semibold text-text-primary">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

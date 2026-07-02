import { Search } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { ImplementationStatus } from '@/types'
import type { ValidationScoreFilter, ValidationStatusFilter } from '@/hooks/useValidationFilters'
import { cn } from '@/utils/cn'

interface ValidationListItem {
  id: string
  title: string
  estimated: number
  status: ImplementationStatus
}

interface ValidationListPanelProps {
  items: ValidationListItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  search: string
  onSearchChange: (v: string) => void
  statusFilter: ValidationStatusFilter
  onStatusFilterChange: (v: ValidationStatusFilter) => void
  scoreFilter: ValidationScoreFilter
  onScoreFilterChange: (v: ValidationScoreFilter) => void
}

const statusFilters: { value: ValidationStatusFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'implemented', label: '완료' },
  { value: 'mostly_implemented', label: '대부분' },
  { value: 'partially_implemented', label: '일부' },
  { value: 'not_implemented', label: '미구현' },
]

const scoreFilters: { value: ValidationScoreFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'high', label: '70%+' },
  { value: 'medium', label: '40-69%' },
  { value: 'low', label: '<40%' },
]

export function ValidationListPanel({
  items,
  selectedId,
  onSelect,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  scoreFilter,
  onScoreFilterChange,
}: ValidationListPanelProps) {
  return (
    <Card padding="none" className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-border p-4">
        <h3 className="text-sm font-semibold text-text-primary">요구사항 선택</h3>
        <div className="relative mt-3">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="검색..."
            className="h-8 w-full rounded-lg border border-border bg-background pl-8 pr-3 text-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="border-b border-border px-4 py-3 space-y-3">
        <div>
          <p className="mb-1.5 text-[10px] font-medium uppercase text-text-secondary">상태</p>
          <div className="flex flex-wrap gap-1">
            {statusFilters.map((f) => (
              <FilterChip key={f.value} active={statusFilter === f.value} onClick={() => onStatusFilterChange(f.value)} label={f.label} />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-[10px] font-medium uppercase text-text-secondary">추정 점수</p>
          <div className="flex flex-wrap gap-1">
            {scoreFilters.map((f) => (
              <FilterChip key={f.value} active={scoreFilter === f.value} onClick={() => onScoreFilterChange(f.value)} label={f.label} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              'w-full border-b border-border px-4 py-3 text-left transition-colors',
              selectedId === item.id ? 'border-l-2 border-l-primary bg-primary/5' : 'hover:bg-gray-50',
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-text-secondary">{item.id}</span>
              <StatusBadge status={item.status} />
            </div>
            <p className="mt-1 text-sm font-medium text-text-primary">{item.title}</p>
            <div className="mt-2">
              <div className="mb-1 flex justify-between text-[10px] text-text-secondary">
                <span>추정 점수</span>
                <span className="font-semibold text-primary">~{item.estimated}%</span>
              </div>
              <ProgressBar value={item.estimated} size="sm" />
            </div>
          </button>
        ))}
      </div>
    </Card>
  )
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-md px-2 py-0.5 text-[10px] font-medium',
        active ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-text-secondary',
      )}
    >
      {label}
    </button>
  )
}

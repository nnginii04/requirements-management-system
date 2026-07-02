import { useState } from 'react'
import { Search, Plus, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { Requirement } from '@/types'
import type { StatusFilter, TypeFilter, PriorityFilter } from '@/hooks/useRequirementFilters'
import { hasReviewIssue } from '@/mocks'
import { getRequirementStatusByScore } from '@/utils/requirement'
import { getBaselineLabel } from '@/utils/traceability'
import { requirementTypeLabels, priorityLabels } from '@/utils/labels'
import { getUserById } from '@/mocks'
import { getPriorityColor } from '@/utils/colors'
import { cn } from '@/utils/cn'

interface RequirementListPanelProps {
  requirements: Requirement[]
  selectedId: string | null
  onSelect: (id: string) => void
  search: string
  onSearchChange: (value: string) => void
  typeFilter: TypeFilter
  onTypeFilterChange: (value: TypeFilter) => void
  priorityFilter: PriorityFilter
  onPriorityFilterChange: (value: PriorityFilter) => void
  statusFilter: StatusFilter
  onStatusFilterChange: (value: StatusFilter) => void
}

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'implemented', label: '완료' },
  { value: 'mostly_implemented', label: '진행중' },
  { value: 'partially_implemented', label: '일부 구현' },
  { value: 'not_implemented', label: '미구현' },
  { value: 'review_needed', label: '검토 필요' },
]

export function RequirementListPanel({
  requirements,
  selectedId,
  onSelect,
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  statusFilter,
  onStatusFilterChange,
}: RequirementListPanelProps) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const activeFilterCount = [
    typeFilter !== 'all',
    statusFilter !== 'all',
    priorityFilter !== 'all',
  ].filter(Boolean).length

  return (
    <Card padding="none" className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">
            요구사항 목록
          </h3>
          <Link
            to="/requirements/new"
            className="inline-flex h-7 items-center gap-1 rounded-md bg-primary px-2 text-xs font-medium text-white hover:bg-primary/90"
          >
            <Plus className="h-3 w-3" />
            새로 등록
          </Link>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ID, 제목 검색..."
            className="h-8 w-full rounded-lg border border-border bg-background pl-8 pr-3 text-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          className={cn(
            'mt-2 flex w-full items-center justify-between rounded-lg border px-2.5 py-1.5 text-xs transition-colors',
            filtersOpen || activeFilterCount > 0
              ? 'border-primary/30 bg-primary/5 text-primary'
              : 'border-border text-text-secondary hover:bg-gray-50',
          )}
        >
          <span className="flex items-center gap-1.5 font-medium">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            필터
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-white">
                {activeFilterCount}
              </span>
            )}
          </span>
          <ChevronDown
            className={cn('h-3.5 w-3.5 transition-transform', filtersOpen && 'rotate-180')}
          />
        </button>
      </div>

      {filtersOpen && (
        <div className="shrink-0 space-y-2 border-b border-border px-4 py-3">
          <FilterSelect
            label="유형"
            value={typeFilter}
            onChange={(v) => onTypeFilterChange(v as TypeFilter)}
            options={[
              { value: 'all', label: '전체' },
              { value: 'functional', label: '기능' },
              { value: 'non_functional', label: '비기능' },
            ]}
          />
          <FilterSelect
            label="상태"
            value={statusFilter}
            onChange={(v) => onStatusFilterChange(v as StatusFilter)}
            options={statusFilters.map((f) => ({ value: f.value, label: f.label }))}
          />
          <FilterSelect
            label="우선순위"
            value={priorityFilter}
            onChange={(v) => onPriorityFilterChange(v as PriorityFilter)}
            options={(['all', 'critical', 'high', 'medium', 'low'] as PriorityFilter[]).map(
              (f) => ({ value: f, label: f === 'all' ? '전체' : priorityLabels[f] ?? f }),
            )}
          />
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
        {requirements.length === 0 ? (
          <p className="p-4 text-center text-xs text-text-secondary">검색 결과 없음</p>
        ) : (
          requirements.map((req) => (
            <RequirementListItem
              key={req.id}
              requirement={req}
              selected={selectedId === req.id}
              onClick={() => onSelect(req.id)}
            />
          ))
        )}
      </div>
    </Card>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-medium text-text-secondary">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="field-input h-8 w-full text-xs"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function RequirementListItem({
  requirement,
  selected,
  onClick,
}: {
  requirement: Requirement
  selected: boolean
  onClick: () => void
}) {
  const implStatus = getRequirementStatusByScore(
    requirement.implementationScore,
    hasReviewIssue(requirement.id),
  )
  const owner = getUserById(requirement.owner)
  const priorityColor = getPriorityColor(requirement.priority)

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full border-b border-border px-4 py-3 text-left transition-colors',
        selected ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-gray-50',
      )}
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-text-secondary">{requirement.id}</span>
        <StatusBadge status={implStatus} />
      </div>
      <p className="text-sm font-medium text-text-primary">{requirement.title}</p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Badge variant="outline" className="text-[10px]">
          {requirement.type === 'functional' ? requirementTypeLabels.functional : requirementTypeLabels.non_functional}
        </Badge>
        <span className={cn('text-[10px] font-medium', priorityColor.text)}>
          {priorityLabels[requirement.priority] ?? requirement.priority}
        </span>
      </div>
      <div className="mt-2">
        <div className="mb-1 flex justify-between text-[10px] text-text-secondary">
          <span>~{requirement.implementationScore}%</span>
          <span>{owner?.role ?? '—'}</span>
        </div>
        <ProgressBar value={requirement.implementationScore} size="sm" />
      </div>
      <p className="mt-1.5 text-[10px] text-text-secondary">
        베이스라인: {getBaselineLabel(requirement.baseline)}
      </p>
    </button>
  )
}

import { useMemo, useState } from 'react'
import type { ImplementationStatus, Requirement, RequirementPriority } from '@/types'
import { hasReviewIssue } from '@/mocks'
import { getRequirementStatusByScore } from '@/utils/requirement'

export type TypeFilter = 'all' | 'functional' | 'non_functional'
export type PriorityFilter = 'all' | RequirementPriority
export type StatusFilter =
  | 'all'
  | ImplementationStatus

export function useRequirementFilters(requirements: Requirement[]) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const filtered = useMemo(() => {
    return requirements.filter((req) => {
      const implStatus = getRequirementStatusByScore(
        req.implementationScore,
        hasReviewIssue(req.id),
      )

      if (search) {
        const q = search.toLowerCase()
        const matches =
          req.id.toLowerCase().includes(q) ||
          req.title.toLowerCase().includes(q) ||
          req.description.toLowerCase().includes(q)
        if (!matches) return false
      }

      if (typeFilter !== 'all' && req.type !== typeFilter) return false
      if (priorityFilter !== 'all' && req.priority !== priorityFilter) return false
      if (statusFilter !== 'all' && implStatus !== statusFilter) return false

      return true
    })
  }, [requirements, search, typeFilter, priorityFilter, statusFilter])

  return {
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    priorityFilter,
    setPriorityFilter,
    statusFilter,
    setStatusFilter,
    filtered,
  }
}

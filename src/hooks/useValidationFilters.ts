import { useMemo, useState } from 'react'
import type { ImplementationStatus } from '@/types'
import type { ValidationListEntry } from '@/utils/validationListApi'

export type ValidationStatusFilter = 'all' | ImplementationStatus
export type ValidationScoreFilter = 'all' | 'high' | 'medium' | 'low'

export function useValidationFilters(items: ValidationListEntry[]) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ValidationStatusFilter>('all')
  const [scoreFilter, setScoreFilter] = useState<ValidationScoreFilter>('all')

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (search) {
        const q = search.toLowerCase()
        if (
          !item.requirementId.toLowerCase().includes(q) &&
          !item.title.toLowerCase().includes(q)
        ) {
          return false
        }
      }
      if (statusFilter !== 'all' && item.status !== statusFilter) return false
      if (scoreFilter === 'high' && item.estimated < 70) return false
      if (scoreFilter === 'medium' && (item.estimated < 40 || item.estimated >= 70)) return false
      if (scoreFilter === 'low' && item.estimated >= 40) return false
      return true
    })
  }, [items, search, statusFilter, scoreFilter])

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    scoreFilter,
    setScoreFilter,
    filtered,
    items,
  }
}

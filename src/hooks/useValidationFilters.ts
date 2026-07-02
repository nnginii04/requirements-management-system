import { useMemo, useState } from 'react'
import type { ImplementationStatus } from '@/types'
import type { Requirement } from '@/types'
import { getValidationStatus } from '@/utils/validation'

export type ValidationStatusFilter = 'all' | ImplementationStatus
export type ValidationScoreFilter = 'all' | 'high' | 'medium' | 'low'

export function useValidationFilters(requirements: Requirement[]) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ValidationStatusFilter>('all')
  const [scoreFilter, setScoreFilter] = useState<ValidationScoreFilter>('all')

  const enriched = useMemo(() => {
    return requirements
      .filter((req) => req.implementationScore > 0)
      .map((req) => {
        const estimated = req.implementationScore
        const status = getValidationStatus(estimated)
        return { requirement: req, estimated, status }
      })
  }, [requirements])

  const filtered = useMemo(() => {
    return enriched.filter(({ requirement, estimated, status }) => {
      if (search) {
        const q = search.toLowerCase()
        if (
          !requirement.id.toLowerCase().includes(q) &&
          !requirement.title.toLowerCase().includes(q)
        ) {
          return false
        }
      }
      if (statusFilter !== 'all' && status !== statusFilter) return false
      if (scoreFilter === 'high' && estimated < 70) return false
      if (scoreFilter === 'medium' && (estimated < 40 || estimated >= 70)) return false
      if (scoreFilter === 'low' && estimated >= 40) return false
      return true
    })
  }, [enriched, search, statusFilter, scoreFilter])

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    scoreFilter,
    setScoreFilter,
    filtered,
    enriched,
  }
}

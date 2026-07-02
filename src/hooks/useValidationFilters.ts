import { useMemo, useState } from 'react'
import type { ImplementationStatus } from '@/types'
import type { Requirement } from '@/types'
import { getValidationDetail } from '@/mocks/data/validationDetails'
import {
  calculateEstimatedScore,
  calculateSimilarityAverage,
  getValidationStatus,
} from '@/utils/validation'

export type ValidationStatusFilter = 'all' | ImplementationStatus
export type ValidationScoreFilter = 'all' | 'high' | 'medium' | 'low'

export function useValidationFilters(requirements: Requirement[]) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ValidationStatusFilter>('all')
  const [scoreFilter, setScoreFilter] = useState<ValidationScoreFilter>('all')

  const withValidation = useMemo(
    () => requirements.filter((r) => getValidationDetail(r.id)),
    [requirements],
  )

  const enriched = useMemo(() => {
    return withValidation.map((req) => {
      const detail = getValidationDetail(req.id)!
      const estimated = calculateEstimatedScore(detail.matches, detail.acceptanceCriteriaStatus)
      const status = getValidationStatus(estimated)
      return { requirement: req, detail, estimated, status }
    })
  }, [withValidation])

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

export function getSelectedValidation(
  requirementId: string | null,
  requirements: Requirement[],
) {
  if (!requirementId) return null
  const req = requirements.find((r) => r.id === requirementId)
  const detail = getValidationDetail(requirementId)
  if (!req || !detail) return null

  const estimated = calculateEstimatedScore(detail.matches, detail.acceptanceCriteriaStatus)
  const similarityAvg = calculateSimilarityAverage(detail.matches)
  const status = getValidationStatus(estimated)

  return { requirement: req, detail, estimated, similarityAvg, status }
}

import { describe, expect, it } from 'vitest'
import {
  calculateOverallProgress,
  calculateProgressChange,
  getRequirementStatusByScore,
} from './requirement'
import type { Requirement } from '@/types'

function req(implementationScore: number): Requirement {
  return { implementationScore } as Requirement
}

describe('getRequirementStatusByScore', () => {
  it('maps scores to implementation status by threshold', () => {
    expect(getRequirementStatusByScore(100)).toBe('implemented')
    expect(getRequirementStatusByScore(90)).toBe('implemented')
    expect(getRequirementStatusByScore(89)).toBe('mostly_implemented')
    expect(getRequirementStatusByScore(70)).toBe('mostly_implemented')
    expect(getRequirementStatusByScore(69)).toBe('partially_implemented')
    expect(getRequirementStatusByScore(40)).toBe('partially_implemented')
    expect(getRequirementStatusByScore(39)).toBe('not_implemented')
    expect(getRequirementStatusByScore(0)).toBe('not_implemented')
  })

  it('overrides to review_needed when a review issue exists, regardless of score', () => {
    expect(getRequirementStatusByScore(100, true)).toBe('review_needed')
    expect(getRequirementStatusByScore(0, true)).toBe('review_needed')
  })
})

describe('calculateOverallProgress', () => {
  it('returns 0 for an empty list', () => {
    expect(calculateOverallProgress([])).toBe(0)
  })

  it('returns the rounded average implementation score', () => {
    expect(calculateOverallProgress([req(80), req(90)])).toBe(85)
    expect(calculateOverallProgress([req(80), req(81)])).toBe(81) // 80.5 → 81
    expect(calculateOverallProgress([req(0), req(0), req(1)])).toBe(0) // 0.33 → 0
  })
})

describe('calculateProgressChange', () => {
  it('returns the delta rounded to one decimal', () => {
    expect(calculateProgressChange(85, 80)).toBe(5)
    expect(calculateProgressChange(80, 85)).toBe(-5)
    expect(calculateProgressChange(80.25, 80)).toBe(0.3)
  })
})

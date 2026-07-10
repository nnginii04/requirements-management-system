import { describe, expect, it } from 'vitest'
import {
  calculateEstimatedScore,
  calculateSimilarityAverage,
  getConnectionStrength,
  getValidationStatus,
  type AcceptanceCriterionStatus,
  type CodeMatchDetail,
} from './validation'

function match(score: number): CodeMatchDetail {
  return { score } as unknown as CodeMatchDetail
}

function ac(score: number): AcceptanceCriterionStatus {
  return { criterion: 'c', score, implemented: score >= 50 }
}

describe('calculateSimilarityAverage', () => {
  it('returns 0 when no match clears the 0.4 visibility threshold', () => {
    expect(calculateSimilarityAverage([match(0.1), match(0.39)])).toBe(0)
    expect(calculateSimilarityAverage([])).toBe(0)
  })

  it('averages only the top-K visible matches, rounded to 2 decimals', () => {
    // visible: 0.9, 0.8, 0.6, 0.5 → topK=2 → (0.9+0.8)/2 = 0.85
    expect(calculateSimilarityAverage([match(0.5), match(0.9), match(0.6), match(0.8)], 2)).toBe(
      0.85,
    )
  })

  it('excludes sub-threshold matches from the average', () => {
    // only 0.8 and 0.6 are visible → 0.7
    expect(calculateSimilarityAverage([match(0.8), match(0.6), match(0.2)])).toBe(0.7)
  })
})

describe('calculateEstimatedScore', () => {
  it('uses similarity only when no acceptance criteria are provided', () => {
    // sim avg 0.8 → 80
    expect(calculateEstimatedScore([match(0.8)])).toBe(80)
  })

  it('blends similarity (60%) and acceptance criteria (40%)', () => {
    // simScore 80, acAvg 100 → 80*0.6 + 100*0.4 = 88
    expect(calculateEstimatedScore([match(0.8)], [ac(100)])).toBe(88)
  })

  it('returns 0 when there are no visible matches and no criteria', () => {
    expect(calculateEstimatedScore([match(0.3)])).toBe(0)
  })
})

describe('getValidationStatus', () => {
  it('delegates to the score-threshold mapping', () => {
    expect(getValidationStatus(95)).toBe('implemented')
    expect(getValidationStatus(50)).toBe('partially_implemented')
    expect(getValidationStatus(10)).toBe('not_implemented')
  })
})

describe('getConnectionStrength', () => {
  it('bands similarity scores into strength labels', () => {
    expect(getConnectionStrength(0.39)).toBe('hidden')
    expect(getConnectionStrength(0.4)).toBe('weak')
    expect(getConnectionStrength(0.7)).toBe('medium')
    expect(getConnectionStrength(0.85)).toBe('strong')
    expect(getConnectionStrength(1)).toBe('strong')
  })
})

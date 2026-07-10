import { describe, expect, it } from 'vitest'
import {
  bumpScore,
  mapFilesToRequirements,
  parseRequirementIds,
  scoreFromValidationDetail,
} from './scoreEngine.js'
import type { RequirementValidationDetail } from '../../src/utils/validation.js'

describe('parseRequirementIds', () => {
  it('extracts REQ-### ids, uppercases, and de-duplicates', () => {
    expect(parseRequirementIds('fix req-001 and REQ-001 plus REQ-012')).toEqual([
      'REQ-001',
      'REQ-012',
    ])
  })

  it('returns an empty array when no ids are present', () => {
    expect(parseRequirementIds('no ids here')).toEqual([])
  })

  it('ignores ids with too few digits', () => {
    expect(parseRequirementIds('REQ-1 REQ-42')).toEqual([])
  })

  it('matches the first three digits of a longer number (regex is unanchored)', () => {
    expect(parseRequirementIds('REQ-1234')).toEqual(['REQ-123'])
  })
})

describe('bumpScore', () => {
  it('applies the delta and rounds to one decimal', () => {
    expect(bumpScore(80, 5.25)).toBe(85.3)
  })

  it('clamps to the 0–100 range', () => {
    expect(bumpScore(98, 10)).toBe(100)
    expect(bumpScore(5, -20)).toBe(0)
  })
})

describe('mapFilesToRequirements', () => {
  it('maps changed files to requirements by keyword', () => {
    expect(mapFilesToRequirements(['src/auth/Login.java']).sort()).toEqual(
      ['REQ-001', 'REQ-002', 'REQ-007'].sort(),
    )
  })

  it('unions requirements across multiple files and de-duplicates', () => {
    const result = mapFilesToRequirements(['signup/Signup.ts', 'dashboard/View.tsx'])
    expect(new Set(result)).toEqual(new Set(['REQ-002', 'REQ-003']))
  })

  it('returns an empty array when no keyword matches', () => {
    expect(mapFilesToRequirements(['README.md'])).toEqual([])
  })
})

describe('scoreFromValidationDetail', () => {
  it('blends similarity and acceptance criteria into the estimated score', () => {
    const detail = {
      matches: [{ score: 0.8 }],
      acceptanceCriteriaStatus: [{ criterion: 'c', score: 100, implemented: true }],
    } as unknown as RequirementValidationDetail
    // simScore 80, acAvg 100 → 80*0.6 + 100*0.4 = 88
    expect(scoreFromValidationDetail(detail)).toBe(88)
  })
})

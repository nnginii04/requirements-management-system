import type { RequirementValidationDetail } from '../../src/utils/validation.js'
import { calculateEstimatedScore } from '../../src/utils/validation.js'

export function scoreFromValidationDetail(detail: RequirementValidationDetail): number {
  return calculateEstimatedScore(detail.matches, detail.acceptanceCriteriaStatus)
}

export function parseRequirementIds(text: string): string[] {
  const matches = text.match(/REQ-\d{3}/gi) ?? []
  return [...new Set(matches.map((m) => m.toUpperCase()))]
}

export function bumpScore(current: number, delta: number): number {
  return Math.min(100, Math.max(0, Math.round((current + delta) * 10) / 10))
}

export function mapFilesToRequirements(changedFiles: string[]): string[] {
  const map: Record<string, string[]> = {
    auth: ['REQ-001', 'REQ-002', 'REQ-007'],
    login: ['REQ-001'],
    signup: ['REQ-002'],
    dashboard: ['REQ-003'],
    password: ['REQ-004'],
    security: ['REQ-006', 'REQ-010'],
    jwt: ['REQ-001', 'REQ-007'],
  }

  const found = new Set<string>()
  for (const file of changedFiles) {
    const lower = file.toLowerCase()
    for (const [key, reqs] of Object.entries(map)) {
      if (lower.includes(key)) reqs.forEach((r) => found.add(r))
    }
  }
  return [...found]
}

import type { Requirement } from '@/types'

export function nextRequirementId(requirements: Requirement[]): string {
  const max = requirements.reduce((highest, req) => {
    const match = req.id.match(/^REQ-(\d+)$/)
    if (!match) return highest
    return Math.max(highest, Number.parseInt(match[1], 10))
  }, 0)
  return `REQ-${String(max + 1).padStart(3, '0')}`
}

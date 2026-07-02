import type { Requirement } from '@/types'
import { fetchValidationList } from '@/api/client'
import type { ValidationListItem } from '@/api/types'
import { getValidationStatus } from '@/utils/validation'

export async function loadValidationList(
  projectId: string,
  requirements: Requirement[],
  apiConnected: boolean,
): Promise<ValidationListItem[]> {
  if (apiConnected) {
    try {
      return await fetchValidationList(projectId)
    } catch {
      // fallback
    }
  }

  return requirements.map((r) => ({
    requirementId: r.id,
    title: r.title,
    estimated: r.implementationScore,
    status: getValidationStatus(r.implementationScore),
    similarityAvg: 0,
  }))
}

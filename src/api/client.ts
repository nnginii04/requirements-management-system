import type {
  BuildHistory,
  Requirement,
  RequirementBuildSnapshot,
  RequirementVersion,
} from '@/types'
import type { RequirementValidationDetail } from '@/utils/validation'
import type { ImpactAnalysis } from '@/api/types'

const BASE = '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`API ${res.status}: ${body || res.statusText}`)
  }
  const json = (await res.json()) as { data: T }
  return json.data
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/health`)
    return res.ok
  } catch {
    return false
  }
}

export function fetchRequirements(): Promise<Requirement[]> {
  return request<Requirement[]>('/requirements')
}

export function fetchRequirement(id: string): Promise<Requirement> {
  return request<Requirement>(`/requirements/${id}`)
}

export function patchRequirement(id: string, patch: Partial<Requirement>): Promise<Requirement> {
  return request<Requirement>(`/requirements/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
}

export function createRequirement(body: Partial<Requirement>): Promise<Requirement> {
  return request<Requirement>('/requirements', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function fetchRequirementVersions(requirementId: string): Promise<RequirementVersion[]> {
  return request<RequirementVersion[]>(`/requirements/${requirementId}/versions`)
}

export function fetchImpact(requirementId: string): Promise<ImpactAnalysis> {
  return request<ImpactAnalysis>(`/requirements/${requirementId}/impact`)
}

export interface ValidationResponse {
  requirement: Requirement
  detail: RequirementValidationDetail | null
  estimated: number
  similarityAvg: number
  status: string
  scoreBreakdown: { method: string; topK: number; similarityComponent: number; note: string } | null
}

export function fetchValidation(requirementId: string): Promise<ValidationResponse> {
  return request<ValidationResponse>(`/validation/${requirementId}`)
}

export function fetchBuilds(): Promise<BuildHistory[]> {
  return request<BuildHistory[]>('/builds')
}

export function fetchBuildSnapshots(buildNumber: number): Promise<RequirementBuildSnapshot[]> {
  return request<RequirementBuildSnapshot[]>(`/builds/${buildNumber}/snapshots`)
}

export function fetchRequirementTimeline(
  requirementId: string,
): Promise<RequirementBuildSnapshot[]> {
  return request<RequirementBuildSnapshot[]>(`/builds/requirements/${requirementId}/timeline`)
}

export function simulateBuild(body: {
  commitMessage?: string
  changedFiles?: string[]
  status?: 'success' | 'failure'
}): Promise<{ buildNumber: number; updatedRequirements: string[]; build: BuildHistory }> {
  return request('/builds/simulate', { method: 'POST', body: JSON.stringify(body) })
}

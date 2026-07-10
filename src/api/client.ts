import type {
  BuildHistory,
  Requirement,
  RequirementBuildSnapshot,
  RequirementVersion,
  User,
} from '@/types'
import type { RequirementValidationDetail } from '@/utils/validation'
import type {
  ImpactAnalysis,
  ProjectView,
  SessionInfo,
  IntegrationStatus,
  ValidationListItem,
  DocumentsResponse,
  GenerateDocumentRequest,
  AnalysisFinding,
  AnalysisSummary,
  DocumentQualityCheck,
  DashboardAggregateResponse,
  GeneratedDocumentRecord,
  TraceabilityMatrixItem,
} from '@/api/types'

import { clearToken, getToken } from '@/api/auth'

const BASE = '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    ...init,
  })
  if (res.status === 401) {
    clearToken()
    if (window.location.pathname !== '/login') {
      window.location.assign('/login')
    }
    throw new Error('인증이 필요합니다.')
  }
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`API ${res.status}: ${body || res.statusText}`)
  }
  if (res.status === 204) {
    return undefined as T
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

export function deleteRequirement(id: string): Promise<void> {
  return request<void>(`/requirements/${id}`, { method: 'DELETE' })
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

export function fetchAllVersions(): Promise<RequirementVersion[]> {
  return request<RequirementVersion[]>('/versions')
}

export function fetchValidationList(projectId: string): Promise<ValidationListItem[]> {
  return request<ValidationListItem[]>(`/validation?projectId=${encodeURIComponent(projectId)}`)
}

export function fetchProjectTraceabilityMatrix(projectId: string): Promise<TraceabilityMatrixItem[]> {
  return request<TraceabilityMatrixItem[]>(`/traceability/projects/${projectId}/matrix`)
}

export function fetchRequirementTraceability(requirementId: string): Promise<TraceabilityMatrixItem> {
  return request<TraceabilityMatrixItem>(`/traceability/requirements/${requirementId}`)
}

export function fetchDashboardSummary(projectId: string): Promise<DashboardAggregateResponse> {
  return request<DashboardAggregateResponse>(`/dashboard/projects/${projectId}`)
}

export function fetchProjects(): Promise<ProjectView[]> {
  return request<ProjectView[]>('/projects')
}

export function fetchProject(projectId: string): Promise<ProjectView> {
  return request<ProjectView>(`/projects/${projectId}`)
}

export function fetchSession(): Promise<SessionInfo> {
  return request<SessionInfo>('/projects/active/current')
}

export function setActiveProject(projectId: string): Promise<{ activeProjectId: string }> {
  return request('/projects/active', {
    method: 'PATCH',
    body: JSON.stringify({ projectId }),
  })
}

export function fetchBaselines(projectId: string) {
  return request<import('@/types').Baseline[]>(`/projects/${projectId}/baselines`)
}

export function fetchIntegrations(projectId: string): Promise<IntegrationStatus> {
  return request<IntegrationStatus>(`/projects/${projectId}/integrations`)
}

export function fetchAnalysisFindings(projectId: string): Promise<AnalysisFinding[]> {
  return request<AnalysisFinding[]>(`/analysis/projects/${projectId}/findings`)
}

export function fetchAnalysisSummary(projectId: string): Promise<AnalysisSummary> {
  return request<AnalysisSummary>(`/analysis/projects/${projectId}/summary`)
}

export function recomputeAnalysis(projectId: string) {
  return request(`/analysis/projects/${projectId}/recompute`, { method: 'POST' })
}

export function fetchDocuments(projectId: string): Promise<DocumentsResponse> {
  return request<DocumentsResponse>(`/documents/projects/${projectId}`)
}

export function recomputeValidationRequirement(requirementId: string) {
  return request(`/validation/${requirementId}/recompute`, { method: 'POST' })
}

export function recomputeValidationProject(projectId: string) {
  return request(`/validation/projects/${projectId}/recompute`, { method: 'POST' })
}

export function generateDocumentApi(body: GenerateDocumentRequest): Promise<GeneratedDocumentRecord> {
  return request<GeneratedDocumentRecord>('/documents/generate', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function regenerateDocumentSection(
  documentId: string,
  sectionId: string,
): Promise<GeneratedDocumentRecord> {
  return request<GeneratedDocumentRecord>(`/documents/${documentId}/regenerate-section`, {
    method: 'POST',
    body: JSON.stringify({ sectionId }),
  })
}

export function fetchDocumentQuality(documentId: string): Promise<DocumentQualityCheck> {
  return request<DocumentQualityCheck>(`/documents/${documentId}/quality`)
}

export function patchDocumentSection(
  documentId: string,
  sectionId: string,
  content: string,
): Promise<GeneratedDocumentRecord> {
  return request<GeneratedDocumentRecord>(`/documents/${documentId}`, {
    method: 'PATCH',
    body: JSON.stringify({ sectionId, content }),
  })
}

export function fetchCurrentUser(): Promise<User> {
  return request<User>('/users/me')
}

export function fetchUsers(): Promise<User[]> {
  return request<User[]>('/users')
}

export function setCurrentUser(userId: string): Promise<User> {
  return request<User>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify({ userId }),
  })
}

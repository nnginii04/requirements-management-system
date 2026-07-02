import type { AnalysisFinding, Document, Project } from '@/types'
import type { AnalysisSummary } from '@/utils/analysis'
import type {
  DocumentTabType,
  GeneratedDocument,
  DocumentQualityCheck,
  DocumentSection,
} from '@/mocks/documentGenerator'

export interface ImpactAnalysis {
  requirementId: string
  documents: string[]
  codeFiles: string[]
  tests: string[]
  builds: number[]
  affectedRequirements: string[]
}

export interface ProjectView extends Project {
  totalRequirements?: number
  memberCount?: number
}

export interface SessionInfo {
  activeProjectId: string
  currentUserId: string
}

export interface IntegrationStatus {
  jenkins: { connected: boolean; label: string }
  git: { connected: boolean; label: string }
  aiEngine: { connected: boolean; label: string }
}

export interface ValidationListItem {
  requirementId: string
  title: string
  estimated: number
  status: string
  similarityAvg: number
  matchedFilesCount: number
  missingLogicCount: number
}

export interface GeneratedDocumentRecord extends GeneratedDocument {
  id: string
  projectId: string
}

export interface TraceabilityMatrixItem {
  requirementId: string
  requirementTitle: string
  source: string
  linkedDocuments: string[]
  linkedCodeFiles: string[]
  linkedBuilds: string[]
  linkedTests: string[]
  similarityScore: number
  linkStatus: 'linked' | 'partial' | 'missing'
}

export interface DashboardProjectSummary {
  projectId: string
  projectName: string
  overallProgress: number
  totalRequirements: number
  functionalRequirements: number
  nonFunctionalRequirements: number
  implementedCount: number
  mostlyImplementedCount: number
  partiallyImplementedCount: number
  notImplementedCount: number
  reviewNeededCount: number
  generatedDocumentsCount: number
  latestBuildNumber: number | null
  latestBuildStatus: import('@/types').BuildStatus | null
}

export interface DashboardRequirementCoverageItem {
  requirementId: string
  title: string
  type: import('@/types').RequirementType
  priority: import('@/types').RequirementPriority
  status: import('@/types').RequirementWorkflowStatus
  estimatedImplementationScore: number
  validationStatus: string
  reviewNeeded: boolean
}

export interface DashboardAiInsights {
  duplicateCount: number
  conflictCount: number
  missingCount: number
  traceabilityGapCount: number
  highSeverityFindings: number
  recentFindings: AnalysisFinding[]
}

export interface DashboardBuildTimelineItem {
  buildNumber: number
  buildStatus: import('@/types').BuildStatus
  requirementProgress: number
  progressChange: number
  createdAt: string
}

export interface DashboardValidationSummary {
  requirementId: string
  requirementTitle: string
  estimatedImplementationScore: number
  validationStatus: string
  similarityAverage: number
  matchedFilesCount: number
  missingLogicCount: number
  relatedCodeFiles: string[]
  aiExplanation: string
}

export interface DashboardTraceabilitySummary {
  linkedDocumentsCount: number
  linkedCodeFilesCount: number
  linkedBuildsCount: number
  linkedTestsCount: number
  matrixCoverageRate: number
}

export interface DashboardAggregateResponse {
  projectSummary: DashboardProjectSummary
  requirementCoverage: DashboardRequirementCoverageItem[]
  aiInsights: DashboardAiInsights
  buildTimeline: DashboardBuildTimelineItem[]
  validationSummary: DashboardValidationSummary | null
  traceabilitySummary: DashboardTraceabilitySummary
}

export interface DocumentsResponse {
  catalog: Document[]
  generated: GeneratedDocumentRecord[]
}

export interface GenerateDocumentRequest {
  type: DocumentTabType
  projectId: string
  requirementIds: string[]
  includeTraceability?: boolean
  includeNfr?: boolean
}

export type { AnalysisFinding, AnalysisSummary, DocumentQualityCheck, GeneratedDocument, DocumentSection }

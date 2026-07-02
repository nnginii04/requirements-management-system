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
}

export interface GeneratedDocumentRecord extends GeneratedDocument {
  id: string
  projectId: string
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

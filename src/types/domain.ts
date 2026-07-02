export type LifecycleStage =
  | 'elicitation'
  | 'analysis'
  | 'specification'
  | 'validation'
  | 'tracking'

export type RequirementType = 'functional' | 'non_functional'

export type RequirementPriority = 'critical' | 'high' | 'medium' | 'low'

export type RequirementWorkflowStatus =
  | 'draft'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'deprecated'

export type ImplementationStatus =
  | 'implemented'
  | 'mostly_implemented'
  | 'partially_implemented'
  | 'not_implemented'
  | 'review_needed'

/** @deprecated Use ImplementationStatus or RequirementWorkflowStatus */
export type RequirementStatus = ImplementationStatus | RequirementWorkflowStatus

export type AnalysisFindingType =
  | 'duplicate'
  | 'conflict'
  | 'omission'
  | 'ambiguity'
  | 'gap'
  | 'traceability_gap'
  | 'priority'
  | 'refinement'
  | 'test_recommendation'
  | 'quality'

export type AnalysisSeverity = 'critical' | 'high' | 'medium' | 'low'

export type BuildStatus = 'success' | 'failure' | 'unstable' | 'aborted'

export type TestResult = 'passed' | 'failed' | 'skipped' | 'partial'

export type DocumentType = 'srs' | 'prd' | 'brs' | 'api_spec' | 'test_plan' | 'review_report' | 'baseline_report'

export type TraceabilityTargetType =
  | 'requirement'
  | 'test'
  | 'defect'
  | 'document'
  | 'code'

export type TraceabilityRelationship =
  | 'implements'
  | 'tests'
  | 'depends_on'
  | 'conflicts_with'
  | 'duplicates'
  | 'related'

export interface Project {
  id: string
  name: string
  description: string
  createdAt: string
  progress: number
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  avatarInitials: string
}

export interface TraceabilityLink {
  id: string
  targetType: TraceabilityTargetType
  targetId: string
  relationship: TraceabilityRelationship
}

export interface Requirement {
  id: string
  projectId: string
  title: string
  description: string
  type: RequirementType
  priority: RequirementPriority
  status: RequirementWorkflowStatus
  owner: string
  createdAt: string
  updatedAt: string
  dueDate: string
  version: string
  baseline: string | null
  acceptanceCriteria: string[]
  implementationScore: number
  traceabilityLinks: TraceabilityLink[]
  source?: string
  tags?: string[]
  relatedFeature?: string
}

export interface RequirementVersion {
  id: string
  requirementId: string
  version: string
  changedBy: string
  changedAt: string
  changeSummary: string
  previousContent: string
  currentContent: string
}

export interface Baseline {
  id: string
  name: string
  version: string
  createdAt: string
  requirements: string[]
}

export interface AnalysisFinding {
  id: string
  type: AnalysisFindingType
  requirementIds: string[]
  description: string
  severity: AnalysisSeverity
  confidence: number
  suggestedAction: string
  aiExplanation?: string
  similarityScore?: number
}

export interface CodeFile {
  id: string
  fileName: string
  path: string
  language: string
  module: string
  classes: string[]
  functions: string[]
}

export interface SimilarityScore {
  requirementId: string
  codeFileId: string
  score: number
  reason: string
}

export interface BuildHistory {
  id: string
  projectId: string
  buildNumber: number
  status: BuildStatus
  branch: string
  commitId: string
  commitMessage: string
  testResult: TestResult
  testPassed: number
  testTotal: number
  requirementProgress: number
  progressChange: number
  changedRequirements: string[]
  failedRequirements: string[]
  relatedFiles: string[]
  duration: string
  createdAt: string
}

export interface RequirementBuildSnapshot {
  buildNumber: number
  requirementId: string
  progress: number
  createdAt: string
}

export interface Document {
  id: string
  projectId: string
  type: DocumentType
  title: string
  content: string
  generatedAt: string
  sourceRequirements: string[]
}

export interface NavItem {
  label: string
  path: string
  icon: string
}

export {
  calculateOverallProgress,
  getRequirementStatusByScore,
  calculateProgressChange,
  getImplementationStatusLabel,
} from './requirement'

export { computeDashboardStats } from './dashboard'
export {
  computeAnalysisSummary,
  getFindingTypeLabel,
  getActionLabel,
  getAllFindings,
} from './analysis'
export type {
  DashboardStats,
  ValidationSummary,
  CoverageItem,
  StatusDistributionItem,
  LifecycleProgressItem,
} from './dashboard'

export {
  getStatusColor,
  getWorkflowStatusColor,
  getPriorityColor,
  getSeverityColor,
} from './colors'

export {
  getConnectionStrength,
  getConnectionStrokeWidth,
  getConnectionColor,
  calculateEstimatedScore,
  calculateSimilarityAverage,
  getValidationStatus,
} from './validation'
export {
  computeBuildSummary,
  enrichBuildsWithChange,
  filterBuildsByDateRange,
  getTimelineData,
  getDateProgressData,
} from './buildHistory'
export type { BuildSummary } from './buildHistory'

import type { AnalysisFinding, Requirement } from '@/types'
import {
  fetchAnalysisFindings,
  fetchAnalysisSummary,
} from '@/api/client'
import type { AnalysisSummary } from '@/utils/analysis'
import { computeAnalysisSummary, getAllFindings } from '@/utils/analysis'

export interface AnalysisData {
  findings: AnalysisFinding[]
  summary: AnalysisSummary
}

function mockAnalysisData(requirements: Requirement[]): AnalysisData {
  const findings = getAllFindings()
  return {
    findings,
    summary: computeAnalysisSummary(requirements),
  }
}

export async function loadAnalysisData(
  projectId: string,
  requirements: Requirement[],
  apiConnected: boolean,
): Promise<AnalysisData> {
  const projectReqs = requirements.filter((r) => r.projectId === projectId)

  if (apiConnected) {
    try {
      const [findings, summary] = await Promise.all([
        fetchAnalysisFindings(projectId),
        fetchAnalysisSummary(projectId),
      ])
      return { findings, summary }
    } catch {
      // fallback
    }
  }

  return mockAnalysisData(projectReqs)
}

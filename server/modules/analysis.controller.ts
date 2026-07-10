import { Controller, Get, HttpCode, Inject, Param, Post } from '@nestjs/common'
import { StoreService } from '../core/store.service.js'
import { RecomputeService } from '../core/recompute.service.js'
import { apiError } from '../core/http-error.js'
import type { AnalysisFinding } from '../../src/types/domain.js'
import { calculateOverallProgress } from '../../src/utils/requirement.js'

@Controller('analysis')
export class AnalysisController {
  constructor(
    @Inject(StoreService) private readonly store: StoreService,
    @Inject(RecomputeService) private readonly recompute: RecomputeService,
  ) {}

  private findingsForProject(projectId: string): AnalysisFinding[] {
    const state = this.store.loadDb()
    const projectReqIds = new Set(
      state.requirements.filter((r) => r.projectId === projectId).map((r) => r.id),
    )
    return state.analysisFindings.filter((f) =>
      f.requirementIds.some((id) => projectReqIds.has(id)),
    )
  }

  @Get('projects/:projectId/findings')
  findings(@Param('projectId') projectId: string) {
    return { data: this.findingsForProject(projectId) }
  }

  @Get('projects/:projectId/summary')
  summary(@Param('projectId') projectId: string) {
    const state = this.store.loadDb()
    const requirements = state.requirements.filter((r) => r.projectId === projectId)
    const findings = this.findingsForProject(projectId)

    return {
      data: {
        functionalCount: requirements.filter((r) => r.type === 'functional').length,
        nonFunctionalCount: requirements.filter((r) => r.type === 'non_functional').length,
        duplicateCandidates: findings.filter((f) => f.type === 'duplicate').length,
        conflictCandidates: findings.filter((f) => f.type === 'conflict').length,
        missingRequirements: findings.filter((f) => f.type === 'omission').length,
        traceabilityGaps: findings.filter((f) => f.type === 'traceability_gap').length,
        totalFindings: findings.length,
        overallProgress: calculateOverallProgress(requirements),
      },
    }
  }

  @Get('findings/:id')
  finding(@Param('id') id: string) {
    const finding = this.store.loadDb().analysisFindings.find((f) => f.id === id)
    if (!finding) throw apiError(404, 'Finding not found')
    return { data: finding }
  }

  @Post('projects/:projectId/recompute')
  @HttpCode(200)
  recomputeProject(@Param('projectId') projectId: string) {
    const state = this.store.loadDb()
    const exists = state.projects.some((project) => project.id === projectId)
    if (!exists) throw apiError(404, 'Project not found')

    const updated = this.recompute.projectAnalysis(projectId)
    const findings = this.findingsForProject(projectId)
    return {
      data: {
        projectId,
        findingsCount: findings.length,
        updatedAt: new Date().toISOString(),
        traceabilityRecords: updated.traceabilityRecords.filter(
          (record) => record.projectId === projectId,
        ).length,
      },
    }
  }
}

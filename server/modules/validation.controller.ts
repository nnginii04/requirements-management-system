import { Controller, Get, HttpCode, Inject, Param, Post, Query } from '@nestjs/common'
import { StoreService } from '../core/store.service.js'
import { RecomputeService } from '../core/recompute.service.js'
import { apiError } from '../core/http-error.js'
import {
  calculateEstimatedScore,
  calculateSimilarityAverage,
  getValidationStatus,
} from '../../src/utils/validation.js'
import { enrichMatchesWithSnippets } from '../lib/snippets.js'

@Controller('validation')
export class ValidationController {
  constructor(
    @Inject(StoreService) private readonly store: StoreService,
    @Inject(RecomputeService) private readonly recompute: RecomputeService,
  ) {}

  private buildValidationPayload(requirementId: string, state = this.store.loadDb()) {
    const requirement = state.requirements.find((r) => r.id === requirementId)
    if (!requirement) return null

    let detail = state.validationDetails.find((d) => d.requirementId === requirementId)
    if (!detail) {
      return {
        requirement,
        detail: null,
        estimated: requirement.implementationScore,
        similarityAvg: 0,
        status: getValidationStatus(requirement.implementationScore),
        scoreBreakdown: null,
      }
    }

    detail = {
      ...detail,
      matches: enrichMatchesWithSnippets(detail.matches),
    }

    const estimated = calculateEstimatedScore(detail.matches, detail.acceptanceCriteriaStatus)
    const similarityAvg = calculateSimilarityAverage(detail.matches)

    return {
      requirement: { ...requirement, implementationScore: estimated },
      detail,
      estimated,
      similarityAvg,
      status: getValidationStatus(estimated),
      scoreBreakdown: {
        method: 'Top-K cosine similarity avg × 0.6 + acceptance criteria avg × 0.4',
        topK: 5,
        similarityComponent: Math.round(similarityAvg * 100),
        note: 'AI 추정치 — 확정 구현률 아님',
      },
    }
  }

  @Get()
  list(@Query('projectId') projectIdQuery?: string) {
    const state = this.store.loadDb()
    const projectId = projectIdQuery || state.activeProjectId
    const requirements = state.requirements.filter((r) => r.projectId === projectId)

    const items = requirements
      .map((r) => this.buildValidationPayload(r.id, state))
      .filter(
        (item): item is NonNullable<typeof item> => item !== null && item.detail !== null,
      )
      .map((item) => ({
        requirementId: item.requirement.id,
        title: item.requirement.title,
        estimated: item.estimated,
        status: item.status,
        similarityAvg: item.similarityAvg,
        matchedFilesCount: item.detail?.matches.filter((m) => m.score >= 0.4).length ?? 0,
        missingLogicCount: item.detail?.missingLogic.length ?? 0,
      }))

    return { data: items }
  }

  @Get(':requirementId')
  detail(@Param('requirementId') requirementId: string) {
    const payload = this.buildValidationPayload(requirementId)
    if (!payload) throw apiError(404, 'Requirement not found')
    return { data: payload }
  }

  @Post('projects/:projectId/recompute')
  @HttpCode(200)
  recomputeProject(@Param('projectId') projectId: string) {
    const state = this.store.loadDb()
    const exists = state.projects.some((project) => project.id === projectId)
    if (!exists) throw apiError(404, 'Project not found')

    this.recompute.projectValidation(projectId)
    const updatedState = this.store.loadDb()
    const count = updatedState.validationDetails.filter((detail) =>
      updatedState.requirements.some(
        (requirement) =>
          requirement.projectId === projectId && requirement.id === detail.requirementId,
      ),
    ).length

    return {
      data: {
        projectId,
        validationDetailsCount: count,
        updatedAt: new Date().toISOString(),
      },
    }
  }

  @Post(':requirementId/recompute')
  @HttpCode(200)
  recomputeRequirement(@Param('requirementId') requirementId: string) {
    const state = this.store.loadDb()
    const requirement = state.requirements.find((item) => item.id === requirementId)
    if (!requirement) throw apiError(404, 'Requirement not found')

    this.recompute.requirementValidation(requirementId)
    const payload = this.buildValidationPayload(requirementId)
    return {
      data: {
        requirementId,
        estimated: payload?.estimated ?? requirement.implementationScore,
        status: payload?.status ?? getValidationStatus(requirement.implementationScore),
        updatedAt: new Date().toISOString(),
      },
    }
  }
}

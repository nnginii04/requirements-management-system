import { Body, Controller, Get, Inject, Param, Patch } from '@nestjs/common'
import { StoreService } from '../core/store.service.js'
import { apiError } from '../core/http-error.js'
import { calculateOverallProgress } from '../../src/utils/requirement.js'

@Controller('projects')
export class ProjectsController {
  constructor(@Inject(StoreService) private readonly store: StoreService) {}

  @Get()
  list() {
    const state = this.store.loadDb()
    const projects = state.projects.map((p) => {
      const reqs = state.requirements.filter((r) => r.projectId === p.id)
      return {
        ...p,
        totalRequirements: reqs.length,
        memberCount: state.users.length,
        progress: calculateOverallProgress(reqs),
      }
    })
    return { data: projects }
  }

  @Get('active/current')
  activeCurrent() {
    const state = this.store.loadDb()
    return {
      data: {
        activeProjectId: state.activeProjectId,
        currentUserId: state.currentUserId,
      },
    }
  }

  @Patch('active')
  switchActive(@Body('projectId') projectId?: string) {
    if (!projectId) throw apiError(400, 'projectId required')

    let updated = false
    this.store.mutate((state) => {
      if (!state.projects.some((p) => p.id === projectId)) return
      state.activeProjectId = projectId
      updated = true
    })

    if (!updated) throw apiError(404, 'Project not found')
    return { data: { activeProjectId: projectId } }
  }

  @Get(':projectId')
  detail(@Param('projectId') projectId: string) {
    const state = this.store.loadDb()
    const project = state.projects.find((p) => p.id === projectId)
    if (!project) throw apiError(404, 'Project not found')

    const reqs = state.requirements.filter((r) => r.projectId === project.id)
    return {
      data: {
        ...project,
        totalRequirements: reqs.length,
        memberCount: state.users.length,
        progress: calculateOverallProgress(reqs),
      },
    }
  }

  @Get(':projectId/baselines')
  baselines(@Param('projectId') projectId: string) {
    const state = this.store.loadDb()
    const projectReqIds = new Set(
      state.requirements.filter((r) => r.projectId === projectId).map((r) => r.id),
    )
    const baselines = state.baselines.filter((b) =>
      b.requirements.some((id) => projectReqIds.has(id)),
    )
    return { data: baselines }
  }

  @Get(':projectId/integrations')
  integrations(@Param('projectId') projectId: string) {
    const state = this.store.loadDb()
    const project = state.projects.find((p) => p.id === projectId)
    if (!project) throw apiError(404, 'Project not found')

    const webhookCount = state.webhookEvents.length
    return {
      data: {
        jenkins: {
          connected: webhookCount > 0 || state.builds.length > 0,
          label: webhookCount > 0 ? '웹훅 수신 중' : '설정됨',
        },
        git: {
          connected: true,
          label: 'main 브랜치 연결',
        },
        aiEngine: {
          connected: state.validationDetails.length > 0,
          label: state.validationDetails.length > 0 ? '임베딩 엔진 활성' : '대기',
        },
      },
    }
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common'
import { StoreService } from '../core/store.service.js'
import { apiError } from '../core/http-error.js'
import { CreateRequirementDto, UpdateRequirementDto } from './dto/requirement.dto.js'
import type { Requirement, RequirementWorkflowStatus } from '../../src/types/domain.js'

@Controller('requirements')
export class RequirementsController {
  constructor(private readonly store: StoreService) {}

  @Get()
  list() {
    return { data: this.store.loadDb().requirements }
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    const requirement = this.store.loadDb().requirements.find((r) => r.id === id)
    if (!requirement) throw apiError(404, 'Requirement not found')
    return { data: requirement }
  }

  @Get(':id/versions')
  versions(@Param('id') id: string) {
    const versions = this.store.loadDb().versions.filter((v) => v.requirementId === id)
    return { data: versions }
  }

  @Get(':id/impact')
  impact(@Param('id') id: string) {
    const state = this.store.loadDb()
    const requirement = state.requirements.find((r) => r.id === id)
    if (!requirement) throw apiError(404, 'Requirement not found')

    const detail = state.validationDetails.find((d) => d.requirementId === id)
    const codeFiles = detail?.matches.map((m) => m.displayName) ?? []
    const tests = (detail?.matches.map((m) => m.testCase).filter(Boolean) as string[]) ?? []
    const builds = state.snapshots.filter((s) => s.requirementId === id).map((s) => s.buildNumber)

    const documents = requirement.traceabilityLinks
      .filter((l) => l.targetType === 'document')
      .map((l) => l.targetId)

    const relatedReqs = requirement.traceabilityLinks
      .filter((l) => l.targetType === 'requirement')
      .map((l) => l.targetId)

    return {
      data: {
        requirementId: requirement.id,
        documents,
        codeFiles,
        tests,
        builds,
        affectedRequirements: relatedReqs,
      },
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() patch: UpdateRequirementDto) {
    let updated: Requirement | undefined

    // Only merge fields the client actually sent — DTO instances can carry
    // `undefined` own-properties that would otherwise clobber existing values.
    const definedPatch = Object.fromEntries(
      Object.entries(patch).filter(([, value]) => value !== undefined),
    ) as Partial<Requirement>

    this.store.mutate((state) => {
      const idx = state.requirements.findIndex((r) => r.id === id)
      if (idx === -1) return
      const previous = state.requirements[idx]
      updated = {
        ...previous,
        ...definedPatch,
        id: previous.id,
        updatedAt: new Date().toISOString(),
      }
      state.requirements[idx] = updated

      if (patch.title || patch.description) {
        state.versions.push({
          id: `RV-${Date.now()}`,
          requirementId: id,
          version: updated.version,
          changedBy: 'user-001',
          changedAt: updated.updatedAt,
          changeSummary: patch.title ? `제목 변경: ${patch.title}` : '설명 변경',
          previousContent: previous.description,
          currentContent: updated.description,
        })
      }
    })

    if (!updated) throw apiError(404, 'Requirement not found')
    return { data: updated }
  }

  @Post()
  create(@Body() body: CreateRequirementDto) {
    const state = this.store.loadDb()

    const maxNum = state.requirements.reduce((max, r) => {
      const match = r.id.match(/^REQ-(\d+)$/)
      return match ? Math.max(max, Number.parseInt(match[1], 10)) : max
    }, 0)
    const newId = `REQ-${String(maxNum + 1).padStart(3, '0')}`

    const created: Requirement = {
      id: newId,
      projectId: body.projectId ?? 'proj-001',
      title: body.title ?? '새 요구사항',
      description: body.description ?? '',
      type: body.type ?? 'functional',
      priority: body.priority ?? 'medium',
      status: (body.status as RequirementWorkflowStatus) ?? 'draft',
      owner: body.owner ?? 'user-001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: body.dueDate ?? new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      version: '1.0',
      baseline: null,
      acceptanceCriteria: body.acceptanceCriteria ?? [],
      implementationScore: 0,
      traceabilityLinks: [],
      source: body.source,
      tags: body.tags,
      relatedFeature: body.relatedFeature,
    }

    this.store.mutate((s) => {
      s.requirements.push(created)
    })

    return { data: created }
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    let deleted = false

    this.store.mutate((state) => {
      const idx = state.requirements.findIndex((r) => r.id === id)
      if (idx === -1) return
      deleted = true
      state.requirements.splice(idx, 1)
      state.versions = state.versions.filter((v) => v.requirementId !== id)
      state.validationDetails = state.validationDetails.filter((d) => d.requirementId !== id)
      state.snapshots = state.snapshots.filter((s) => s.requirementId !== id)
    })

    if (!deleted) throw apiError(404, 'Requirement not found')
  }
}

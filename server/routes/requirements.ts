import { Router } from 'express'
import { loadDb, mutate } from '../db/store.js'
import type { Requirement, RequirementWorkflowStatus } from '../../src/types/domain.js'

export const requirementsRouter = Router()

requirementsRouter.get('/', (_req, res) => {
  const { requirements } = loadDb()
  res.json({ data: requirements })
})

requirementsRouter.get('/:id', (req, res) => {
  const req_ = loadDb().requirements.find((r) => r.id === req.params.id)
  if (!req_) return res.status(404).json({ error: 'Requirement not found' })
  res.json({ data: req_ })
})

requirementsRouter.get('/:id/versions', (req, res) => {
  const versions = loadDb().versions.filter((v) => v.requirementId === req.params.id)
  res.json({ data: versions })
})

requirementsRouter.get('/:id/impact', (req, res) => {
  const state = loadDb()
  const requirement = state.requirements.find((r) => r.id === req.params.id)
  if (!requirement) return res.status(404).json({ error: 'Requirement not found' })

  const detail = state.validationDetails.find((d) => d.requirementId === req.params.id)
  const codeFiles = detail?.matches.map((m) => m.displayName) ?? []
  const tests = detail?.matches.map((m) => m.testCase).filter(Boolean) as string[] ?? []
  const builds = state.snapshots
    .filter((s) => s.requirementId === req.params.id)
    .map((s) => s.buildNumber)

  const documents = requirement.traceabilityLinks
    .filter((l) => l.targetType === 'document')
    .map((l) => l.targetId)

  const relatedReqs = requirement.traceabilityLinks
    .filter((l) => l.targetType === 'requirement')
    .map((l) => l.targetId)

  res.json({
    data: {
      requirementId: requirement.id,
      documents,
      codeFiles,
      tests,
      builds,
      affectedRequirements: relatedReqs,
    },
  })
})

requirementsRouter.patch('/:id', (req, res) => {
  const patch = req.body as Partial<Requirement>
  let updated: Requirement | undefined

  mutate((state) => {
    const idx = state.requirements.findIndex((r) => r.id === req.params.id)
    if (idx === -1) return
    const previous = state.requirements[idx]
    updated = {
      ...previous,
      ...patch,
      id: previous.id,
      updatedAt: new Date().toISOString(),
    }
    state.requirements[idx] = updated

    if (patch.title || patch.description) {
      state.versions.push({
        id: `RV-${Date.now()}`,
        requirementId: req.params.id,
        version: updated.version,
        changedBy: 'user-001',
        changedAt: updated.updatedAt,
        changeSummary: patch.title ? `제목 변경: ${patch.title}` : '설명 변경',
        previousContent: previous.description,
        currentContent: updated.description,
      })
    }
  })

  if (!updated) return res.status(404).json({ error: 'Requirement not found' })
  res.json({ data: updated })
})

requirementsRouter.post('/', (req, res) => {
  const body = req.body as Partial<Requirement>
  const state = loadDb()
  const newId = `REQ-${String(state.requirements.length + 1).padStart(3, '0')}`

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

  mutate((s) => {
    s.requirements.push(created)
  })

  res.status(201).json({ data: created })
})

import { Router } from 'express'
import { loadDb, mutate } from '../db/store.js'
import { toDocumentRecord } from '../services/documents.js'
import type { DocumentTabType } from '../../src/mocks/documentGenerator.js'

export const documentsRouter = Router()

documentsRouter.get('/projects/:projectId', (req, res) => {
  const state = loadDb()
  const staticDocs = state.documents.filter((d) => d.projectId === req.params.projectId)
  const generated = state.generatedDocuments.filter((d) => d.projectId === req.params.projectId)
  res.json({
    data: {
      catalog: staticDocs,
      generated,
    },
  })
})

documentsRouter.post('/generate', async (req, res) => {
  const body = req.body as {
    type: DocumentTabType
    projectId: string
    requirementIds: string[]
    includeTraceability?: boolean
    includeNfr?: boolean
  }

  const state = loadDb()
  const requirements = state.requirements.filter(
    (r) => r.projectId === body.projectId && body.requirementIds.includes(r.id),
  )

  if (requirements.length === 0) {
    return res.status(400).json({ error: 'No matching requirements' })
  }

  const { generateDocument } = await import('../../src/mocks/documentGenerator.ts')
  const doc = await generateDocument(body.type, requirements, {
    includeTraceability: body.includeTraceability ?? true,
    includeNfr: body.includeNfr ?? true,
  })

  const record = toDocumentRecord(doc, body.projectId)
  mutate((s) => {
    s.generatedDocuments.push(record)
  })

  res.status(201).json({ data: record })
})

documentsRouter.post('/:id/regenerate-section', async (req, res) => {
  const { sectionId } = req.body as { sectionId?: string }
  if (!sectionId) return res.status(400).json({ error: 'sectionId required' })

  const state = loadDb()
  const doc = state.generatedDocuments.find((d) => d.id === req.params.id)
  if (!doc) return res.status(404).json({ error: 'Document not found' })

  const { regenerateSection } = await import('../../src/mocks/documentGenerator.ts')
  const updated = await regenerateSection(doc, sectionId)

  mutate((s) => {
    const idx = s.generatedDocuments.findIndex((d) => d.id === req.params.id)
    if (idx === -1) return
    s.generatedDocuments[idx] = {
      ...s.generatedDocuments[idx],
      sections: s.generatedDocuments[idx].sections.map((sec) =>
        sec.id === sectionId ? updated : sec,
      ),
    }
  })

  const refreshed = loadDb().generatedDocuments.find((d) => d.id === req.params.id)
  res.json({ data: refreshed })
})

documentsRouter.get('/:id/quality', async (req, res) => {
  const state = loadDb()
  const doc = state.generatedDocuments.find((d) => d.id === req.params.id)
  if (!doc) return res.status(404).json({ error: 'Document not found' })

  const { runQualityCheck } = await import('../../src/mocks/documentGenerator.ts')
  res.json({ data: runQualityCheck(doc, doc.type) })
})

documentsRouter.patch('/:id', (req, res) => {
  const { sectionId, content } = req.body as { sectionId?: string; content?: string }
  if (!sectionId || content === undefined) {
    return res.status(400).json({ error: 'sectionId and content required' })
  }

  let updated = false
  mutate((state) => {
    const doc = state.generatedDocuments.find((d) => d.id === req.params.id)
    if (!doc) return
    doc.sections = doc.sections.map((s) => (s.id === sectionId ? { ...s, content } : s))
    updated = true
  })

  if (!updated) return res.status(404).json({ error: 'Document not found' })
  const doc = loadDb().generatedDocuments.find((d) => d.id === req.params.id)
  res.json({ data: doc })
})

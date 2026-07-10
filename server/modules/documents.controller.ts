import { Body, Controller, Get, HttpCode, Param, Patch, Post } from '@nestjs/common'
import { StoreService } from '../core/store.service.js'
import { DocumentsService } from '../core/documents.service.js'
import { apiError } from '../core/http-error.js'
import { GenerateDocumentDto } from './dto/document.dto.js'

@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly store: StoreService,
    private readonly documents: DocumentsService,
  ) {}

  @Get('projects/:projectId')
  catalog(@Param('projectId') projectId: string) {
    const state = this.store.loadDb()
    return {
      data: {
        catalog: state.documents.filter((d) => d.projectId === projectId),
        generated: state.generatedDocuments.filter((d) => d.projectId === projectId),
      },
    }
  }

  @Post('generate')
  async generate(@Body() body: GenerateDocumentDto) {
    const state = this.store.loadDb()
    const requirements = state.requirements.filter(
      (r) => r.projectId === body.projectId && body.requirementIds.includes(r.id),
    )

    if (requirements.length === 0) {
      throw apiError(400, 'No matching requirements')
    }

    const doc = await this.documents.generate(body.type, requirements, {
      includeTraceability: body.includeTraceability ?? true,
      includeNfr: body.includeNfr ?? true,
    })

    const record = this.documents.toRecord(doc, body.projectId)
    this.store.mutate((s) => {
      s.generatedDocuments.push(record)
    })

    return { data: record }
  }

  @Post(':id/regenerate-section')
  @HttpCode(200)
  async regenerateSection(@Param('id') id: string, @Body('sectionId') sectionId?: string) {
    if (!sectionId) throw apiError(400, 'sectionId required')

    const doc = this.store.loadDb().generatedDocuments.find((d) => d.id === id)
    if (!doc) throw apiError(404, 'Document not found')

    const updated = await this.documents.regenerateSection(doc, sectionId)

    this.store.mutate((s) => {
      const idx = s.generatedDocuments.findIndex((d) => d.id === id)
      if (idx === -1) return
      s.generatedDocuments[idx] = {
        ...s.generatedDocuments[idx],
        sections: s.generatedDocuments[idx].sections.map((sec) =>
          sec.id === sectionId ? updated : sec,
        ),
      }
    })

    const refreshed = this.store.loadDb().generatedDocuments.find((d) => d.id === id)
    return { data: refreshed }
  }

  @Get(':id/quality')
  async quality(@Param('id') id: string) {
    const doc = this.store.loadDb().generatedDocuments.find((d) => d.id === id)
    if (!doc) throw apiError(404, 'Document not found')
    return { data: await this.documents.qualityCheck(doc, doc.type) }
  }

  @Patch(':id')
  updateSection(
    @Param('id') id: string,
    @Body() body: { sectionId?: string; content?: string },
  ) {
    const { sectionId, content } = body
    if (!sectionId || content === undefined) {
      throw apiError(400, 'sectionId and content required')
    }

    let updated = false
    this.store.mutate((state) => {
      const doc = state.generatedDocuments.find((d) => d.id === id)
      if (!doc) return
      doc.sections = doc.sections.map((s) => (s.id === sectionId ? { ...s, content } : s))
      updated = true
    })

    if (!updated) throw apiError(404, 'Document not found')
    return { data: this.store.loadDb().generatedDocuments.find((d) => d.id === id) }
  }
}

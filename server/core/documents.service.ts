import { Injectable } from '@nestjs/common'
import { toDocumentRecord, type GeneratedDocumentRecord } from '../services/documents.js'
import type {
  DocumentTabType,
  GeneratedDocument,
} from '../../src/mocks/documentGenerator.js'
import type { Requirement } from '../../src/types/domain.js'

/**
 * Injectable wrapper over document generation. The generator lives in the shared
 * frontend mock module and is imported lazily to keep boot light.
 */
@Injectable()
export class DocumentsService {
  toRecord(doc: GeneratedDocument, projectId: string): GeneratedDocumentRecord {
    return toDocumentRecord(doc, projectId)
  }

  async generate(
    type: DocumentTabType,
    requirements: Requirement[],
    options: { includeTraceability: boolean; includeNfr: boolean },
  ): Promise<GeneratedDocument> {
    const { generateDocument } = await import('../../src/mocks/documentGenerator.js')
    return generateDocument(type, requirements, options)
  }

  async regenerateSection(doc: GeneratedDocument, sectionId: string) {
    const { regenerateSection } = await import('../../src/mocks/documentGenerator.js')
    return regenerateSection(doc, sectionId)
  }

  async qualityCheck(doc: GeneratedDocument, type: DocumentTabType) {
    const { runQualityCheck } = await import('../../src/mocks/documentGenerator.js')
    return runQualityCheck(doc, type)
  }
}

import type { GeneratedDocument } from '../../src/mocks/documentGenerator.js'

export interface GeneratedDocumentRecord extends GeneratedDocument {
  id: string
  projectId: string
}

export function toDocumentRecord(
  doc: GeneratedDocument,
  projectId: string,
): GeneratedDocumentRecord {
  return {
    ...doc,
    id: `GD-${Date.now()}`,
    projectId,
  }
}

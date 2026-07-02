import type { Requirement } from '@/types'
import type { DocumentTabType, DocumentSection } from '@/mocks/documentGenerator'
import {
  generateDocument as mockGenerateDocument,
  regenerateSection as mockRegenerateSection,
} from '@/mocks/documentGenerator'
import {
  generateDocumentApi,
  patchDocumentSection,
  regenerateDocumentSection,
} from '@/api/client'
import type { GeneratedDocumentRecord } from '@/api/types'

export type DocumentState = {
  type: DocumentTabType
  title: string
  sections: DocumentSection[]
  generatedAt: string
  sourceRequirements: string[]
  id?: string
}

function toDocumentState(record: GeneratedDocumentRecord): DocumentState {
  const { id, projectId: _projectId, ...doc } = record
  return { ...doc, id }
}

export async function generateDocument(
  type: DocumentTabType,
  projectId: string,
  requirements: Requirement[],
  options: { includeTraceability?: boolean; includeNfr?: boolean },
  apiConnected: boolean,
): Promise<DocumentState> {
  const opts = {
    includeTraceability: options.includeTraceability ?? true,
    includeNfr: options.includeNfr ?? true,
  }

  if (apiConnected) {
    try {
      const record = await generateDocumentApi({
        type,
        projectId,
        requirementIds: requirements.map((r) => r.id),
        ...opts,
      })
      return toDocumentState(record)
    } catch {
      // fallback
    }
  }

  return mockGenerateDocument(type, requirements, opts)
}

export async function regenerateSection(
  document: DocumentState,
  sectionId: string,
  apiConnected: boolean,
): Promise<DocumentSection> {
  if (apiConnected && document.id) {
    try {
      const record = await regenerateDocumentSection(document.id, sectionId)
      const section = record.sections.find((s: DocumentSection) => s.id === sectionId)
      if (section) return section
    } catch {
      // fallback
    }
  }

  return mockRegenerateSection(document, sectionId)
}

export async function saveSectionContent(
  document: DocumentState,
  sectionId: string,
  content: string,
  apiConnected: boolean,
): Promise<DocumentState> {
  if (apiConnected && document.id) {
    try {
      const record = await patchDocumentSection(document.id, sectionId, content)
      return toDocumentState(record)
    } catch {
      // fallback
    }
  }

  return {
    ...document,
    sections: document.sections.map((s) => (s.id === sectionId ? { ...s, content } : s)),
  }
}

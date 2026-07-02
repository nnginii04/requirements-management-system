import { useState, useCallback } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Badge } from '@/components/ui/Badge'
import {
  DocumentSidebar,
  DocumentPreview,
  DocumentQualityPanel,
} from '@/components/documents'
import { useRequirements } from '@/contexts/RequirementsContext'
import { useWorkflow } from '@/hooks/useWorkflow'
import { currentProjectId } from '@/mocks'
import {
  generateDocument,
  regenerateSection,
  type DocumentTabType,
  type GeneratedDocument,
} from '@/mocks/documentGenerator'

export function DocumentsPage() {
  const workflow = useWorkflow()
  const { requirements } = useRequirements()
  const projectReqs = requirements.filter((r) => r.projectId === currentProjectId)

  const [activeTab, setActiveTab] = useState<DocumentTabType>('srs')
  const [selectedReqIds, setSelectedReqIds] = useState<Set<string>>(
    () => new Set(projectReqs.map((r) => r.id)),
  )
  const [includeTraceability, setIncludeTraceability] = useState(true)
  const [includeNfr, setIncludeNfr] = useState(true)
  const [document, setDocument] = useState<GeneratedDocument | null>(null)
  const [generating, setGenerating] = useState(false)
  const [editing, setEditing] = useState(false)
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)

  const toggleReq = useCallback((id: string) => {
    setSelectedReqIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const selected = projectReqs.filter((r) => selectedReqIds.has(r.id))
      const doc = await generateDocument(activeTab, selected, {
        includeTraceability,
        includeNfr,
      })
      setDocument(doc)
      setEditing(false)
    } finally {
      setGenerating(false)
    }
  }

  const handleRegenerateSection = async (sectionId: string) => {
    if (!document) return
    setRegeneratingId(sectionId)
    try {
      const updated = await regenerateSection(document, sectionId)
      setDocument({
        ...document,
        sections: document.sections.map((s) => (s.id === sectionId ? updated : s)),
      })
    } finally {
      setRegeneratingId(null)
    }
  }

  const handleContentChange = (sectionId: string, content: string) => {
    if (!document) return
    setDocument({
      ...document,
      sections: document.sections.map((s) => (s.id === sectionId ? { ...s, content } : s)),
    })
  }

  return (
    <PageContainer
      title={workflow.title}
      description={workflow.subtitle}
      workflow={workflow}
      action={<Badge variant="primary">명세화 단계</Badge>}
    >
      <div className="grid min-h-0 grid-cols-1 gap-4 lg:h-[calc(100vh-17rem)] lg:grid-cols-[260px_1fr_260px]">
        <DocumentSidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab)
            setDocument(null)
          }}
          requirements={projectReqs}
          selectedReqIds={selectedReqIds}
          onToggleReq={toggleReq}
          includeTraceability={includeTraceability}
          onTraceabilityChange={setIncludeTraceability}
          includeNfr={includeNfr}
          onNfrChange={setIncludeNfr}
          onGenerate={handleGenerate}
          generating={generating}
        />

        <DocumentPreview
          document={document}
          editing={editing}
          onEditToggle={() => setEditing(!editing)}
          onContentChange={handleContentChange}
          onRegenerateSection={handleRegenerateSection}
          regeneratingId={regeneratingId}
        />

        <DocumentQualityPanel document={document} activeTab={activeTab} />
      </div>
    </PageContainer>
  )
}

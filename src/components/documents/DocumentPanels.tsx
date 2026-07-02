import { useState } from 'react'
import {
  Sparkles,
  Loader2,
  FileDown,
  RefreshCw,
  Pencil,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { Requirement } from '@/types'
import type { DocumentTabType, GeneratedDocument } from '@/mocks/documentGenerator'
import {
  generateDocument,
  runQualityCheck,
  regenerateSection,
} from '@/mocks/documentGenerator'
import { cn } from '@/utils/cn'

interface DocumentSidebarProps {
  activeTab: DocumentTabType
  onTabChange: (tab: DocumentTabType) => void
  requirements: Requirement[]
  selectedReqIds: Set<string>
  onToggleReq: (id: string) => void
  includeTraceability: boolean
  onTraceabilityChange: (v: boolean) => void
  includeNfr: boolean
  onNfrChange: (v: boolean) => void
  onGenerate: () => void
  generating: boolean
}

const tabs: { id: DocumentTabType; label: string }[] = [
  { id: 'srs', label: 'SRS' },
  { id: 'prd', label: 'PRD' },
  { id: 'brs', label: 'BRS' },
]

export function DocumentSidebar({
  activeTab,
  onTabChange,
  requirements,
  selectedReqIds,
  onToggleReq,
  includeTraceability,
  onTraceabilityChange,
  includeNfr,
  onNfrChange,
  onGenerate,
  generating,
}: DocumentSidebarProps) {
  return (
    <Card padding="none" className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-border p-4">
        <SectionHeader title="문서 생성" description="종류 · 요구사항 · 옵션" />
        <div className="mt-3 flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex-1 rounded-lg py-2 text-xs font-medium transition-colors',
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-text-secondary hover:bg-gray-200',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-b border-border p-4">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
          포함할 요구사항 ({selectedReqIds.size})
        </p>
        <div className="max-h-48 space-y-1 overflow-y-auto scrollbar-thin">
          {requirements.map((req) => (
            <label
              key={req.id}
              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={selectedReqIds.has(req.id)}
                onChange={() => onToggleReq(req.id)}
                className="rounded border-border"
              />
              <span className="font-mono text-[10px] text-text-secondary">{req.id}</span>
              <span className="truncate text-xs text-text-primary">{req.title}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-b border-border p-4 space-y-2">
        <p className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">생성 옵션</p>
        <label className="flex items-center gap-2 text-xs text-text-secondary">
          <input
            type="checkbox"
            checked={includeTraceability}
            onChange={(e) => onTraceabilityChange(e.target.checked)}
          />
          추적성 매트릭스 포함
        </label>
        <label className="flex items-center gap-2 text-xs text-text-secondary">
          <input
            type="checkbox"
            checked={includeNfr}
            onChange={(e) => onNfrChange(e.target.checked)}
          />
          비기능 요구사항 포함
        </label>
      </div>

      <div className="mt-auto p-4">
        <button
          type="button"
          className="btn-primary w-full"
          onClick={onGenerate}
          disabled={generating || selectedReqIds.size === 0}
        >
          {generating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          문서 생성
        </button>
      </div>
    </Card>
  )
}

interface DocumentPreviewProps {
  document: GeneratedDocument | null
  editing: boolean
  onEditToggle: () => void
  onContentChange: (sectionId: string, content: string) => void
  onRegenerateSection: (sectionId: string) => void
  regeneratingId: string | null
}

export function DocumentPreview({
  document,
  editing,
  onEditToggle,
  onContentChange,
  onRegenerateSection,
  regeneratingId,
}: DocumentPreviewProps) {
  if (!document) {
    return (
      <Card className="flex h-full min-h-[500px] items-center justify-center">
        <div className="text-center">
          <Sparkles className="mx-auto h-10 w-10 text-text-secondary/30" />
          <p className="mt-3 text-sm text-text-secondary">
            요구사항을 선택하고 문서 생성을 클릭하세요
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card padding="none" className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-text-primary">{document.title}</p>
          <p className="text-[10px] text-text-secondary">
            {new Date(document.generatedAt).toLocaleString('ko-KR')} · {document.sourceRequirements.length}개 요구사항
          </p>
        </div>
        <button type="button" onClick={onEditToggle} className="btn-secondary py-1.5 text-xs">
          <Pencil className="mr-1 h-3 w-3" />
          {editing ? '미리보기' : '편집 미리보기'}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <article className="prose-sm max-w-none">
          {document.sections.map((section) => (
            <section key={section.id} className="mb-8">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-base font-semibold text-text-primary">{section.title}</h3>
                <button
                  type="button"
                  disabled={regeneratingId === section.id}
                  onClick={() => onRegenerateSection(section.id)}
                  className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline disabled:opacity-50"
                >
                  {regeneratingId === section.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3" />
                  )}
                  섹션 재생성
                </button>
              </div>
              {editing ? (
                <textarea
                  value={section.content}
                  onChange={(e) => onContentChange(section.id, e.target.value)}
                  rows={5}
                  className="field-input font-mono text-xs"
                />
              ) : (
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                  {section.content}
                </div>
              )}
            </section>
          ))}
        </article>
      </div>
    </Card>
  )
}

interface DocumentQualityPanelProps {
  document: GeneratedDocument | null
  activeTab: DocumentTabType
}

export function DocumentQualityPanel({ document, activeTab }: DocumentQualityPanelProps) {
  const quality = runQualityCheck(document, activeTab)

  return (
    <Card padding="none" className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-border p-4">
        <SectionHeader title="AI 문서 품질 점검" />
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="rounded-lg border border-border bg-background p-4 text-center">
          <p className="text-3xl font-bold text-text-primary">{quality.score}</p>
          <p className="text-xs text-text-secondary">품질 점수</p>
          <ProgressBar value={quality.score} className="mt-3" />
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-text-secondary">누락 섹션</p>
          {quality.missingSections.length === 0 ? (
            <Badge variant="success">모든 섹션 포함</Badge>
          ) : (
            <ul className="space-y-1">
              {quality.missingSections.map((s) => (
                <li key={s} className="text-xs text-danger">• {s}</li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-text-secondary">추적성 포함 여부</p>
          <Badge variant={quality.traceabilityIncluded ? 'success' : 'warning'}>
            {quality.traceabilityIncluded ? `포함됨 (${quality.traceabilityCoverage}%)` : '미포함'}
          </Badge>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-text-secondary">AI 제안</p>
          <ul className="space-y-1">
            {quality.suggestions.map((s, i) => (
              <li key={i} className="text-xs text-text-secondary">• {s}</li>
            ))}
          </ul>
        </div>

        <div className="border-t border-border pt-4">
          <p className="mb-2 text-xs font-medium text-text-secondary">다운로드</p>
          <div className="space-y-2">
            {['PDF', 'DOCX', 'Markdown'].map((fmt) => (
              <button
                key={fmt}
                type="button"
                className="btn-secondary w-full py-1.5 text-xs"
                onClick={() => alert(`${fmt} Export (mock)`)}
              >
                <FileDown className="mr-1.5 h-3 w-3" />
                {fmt}보내기
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

import { useEffect, useState } from 'react'
import {
  Copy,
  Trash2,
  Pencil,
  Sparkles,
  GitCompare,
  History,
  Target,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { StatusBadge, WorkflowStatusBadge } from '@/components/ui/StatusBadge'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { RequirementVersionCompare } from './RequirementVersionCompare'
import type { Requirement, RequirementVersion, RequirementWorkflowStatus } from '@/types'
import type { TraceabilityMatrixItem } from '@/api/types'
import { getUserById, getBaselinesByProjectId, hasReviewIssue } from '@/mocks'
import { getRequirementStatusByScore } from '@/utils/requirement'
import { workflowStatusLabels, requirementTypeLabels, priorityLabels } from '@/utils/labels'
import { getBaselineLabel, resolveTraceability } from '@/utils/traceability'
import { loadRequirementTraceability, type TraceabilitySource } from '@/utils/traceabilityApi'
import { getPriorityColor } from '@/utils/colors'
import { cn } from '@/utils/cn'

interface RequirementDetailPanelProps {
  requirement: Requirement | null
  allRequirements: Requirement[]
  apiConnected: boolean
  versions: RequirementVersion[]
  onUpdateStatus: (status: RequirementWorkflowStatus) => void
  onAssignBaseline: (baselineId: string | null) => void
  onDelete: () => void
  onDuplicate: () => void
  onEdit: (patch: Partial<Requirement>) => void
}

export function RequirementDetailPanel({
  requirement,
  allRequirements,
  apiConnected,
  versions,
  onUpdateStatus,
  onAssignBaseline,
  onDelete,
  onDuplicate,
  onEdit,
}: RequirementDetailPanelProps) {
  const [showVersionCompare, setShowVersionCompare] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [traceability, setTraceability] = useState<TraceabilityMatrixItem | null>(null)
  const [traceabilitySource, setTraceabilitySource] = useState<TraceabilitySource | null>(null)

  useEffect(() => {
    if (!requirement) {
      setTraceability(null)
      setTraceabilitySource(null)
      return
    }

    let cancelled = false

    loadRequirementTraceability(requirement, allRequirements, apiConnected).then((result) => {
      if (cancelled) return
      setTraceability(result.data)
      setTraceabilitySource(result.source)
    })

    return () => {
      cancelled = true
    }
  }, [requirement, allRequirements, apiConnected])

  if (!requirement) {
    return (
      <Card className="flex h-full items-center justify-center">
        <p className="text-sm text-text-secondary">요구사항을 선택하세요</p>
      </Card>
    )
  }

  const owner = getUserById(requirement.owner)
  const implStatus = getRequirementStatusByScore(
    requirement.implementationScore,
    hasReviewIssue(requirement.id),
  )
  const fallbackTrace = resolveTraceability(requirement, allRequirements)
  const baselines = getBaselinesByProjectId(requirement.projectId)
  const priorityColor = getPriorityColor(requirement.priority)
  const reqVersions = versions

  const trace = traceability ?? {
    requirementId: requirement.id,
    requirementTitle: requirement.title,
    source: requirement.source ?? fallbackTrace.source ?? 'Manual Input',
    linkedDocuments: fallbackTrace.documents.map((d) => d.title),
    linkedCodeFiles: fallbackTrace.codeFiles.map((c) => c.name),
    linkedBuilds: fallbackTrace.builds.map((b) => b.label),
    linkedTests: fallbackTrace.tests.map((t) => t.label),
    similarityScore: 0,
    linkStatus: 'missing' as const,
  }

  const startEdit = () => {
    setEditTitle(requirement.title)
    setEditDescription(requirement.description)
    setIsEditing(true)
  }

  const saveEdit = () => {
    onEdit({ title: editTitle, description: editDescription })
    setIsEditing(false)
  }

  return (
    <Card padding="none" className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-text-secondary">{requirement.id}</p>
            {isEditing ? (
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border px-2 py-1 text-lg font-semibold"
              />
            ) : (
              <h2 className="mt-1 text-lg font-semibold text-text-primary">{requirement.title}</h2>
            )}
          </div>
          <div className="flex shrink-0 flex-wrap gap-1">
            <StatusBadge status={implStatus} />
            <WorkflowStatusBadge status={requirement.status} />
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <ActionButton icon={Pencil} label="수정" onClick={isEditing ? saveEdit : startEdit} />
          <ActionButton icon={Copy} label="복제" onClick={onDuplicate} />
          <ActionButton icon={Trash2} label="삭제" onClick={onDelete} variant="danger" />
          <ActionButton icon={Sparkles} label="AI 재분석" onClick={() => alert('AI 재분석이 실행되었습니다. (mock)')} />
          <ActionButton icon={GitCompare} label="버전 비교" onClick={() => setShowVersionCompare(!showVersionCompare)} />
          <ActionButton icon={History} label="변경 이력" onClick={() => setShowHistory(!showHistory)} />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin p-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <MetaField label="유형">
            <Badge variant="outline">
              {requirement.type === 'functional' ? requirementTypeLabels.functional : requirementTypeLabels.non_functional}
            </Badge>
          </MetaField>
          <MetaField label="우선순위">
            <span className={cn('font-medium', priorityColor.text)}>
              {priorityLabels[requirement.priority] ?? requirement.priority}
            </span>
          </MetaField>
          <MetaField label="담당자">{owner?.name} ({owner?.role})</MetaField>
          <MetaField label="상태 변경">
            <select
              value={requirement.status}
              onChange={(e) => onUpdateStatus(e.target.value as RequirementWorkflowStatus)}
              className="h-7 rounded-md border border-border bg-background px-2 text-xs"
            >
              <option value="draft">{workflowStatusLabels.draft}</option>
              <option value="in_review">{workflowStatusLabels.in_review}</option>
              <option value="approved">{workflowStatusLabels.approved}</option>
              <option value="rejected">{workflowStatusLabels.rejected}</option>
              <option value="deprecated">{workflowStatusLabels.deprecated}</option>
            </select>
          </MetaField>
          <MetaField label="생성일">{formatDate(requirement.createdAt)}</MetaField>
          <MetaField label="수정일">{formatDate(requirement.updatedAt)}</MetaField>
          <MetaField label="마감일">{requirement.dueDate}</MetaField>
          <MetaField label="현재 버전">v{requirement.version}</MetaField>
          <MetaField label="베이스라인 지정">
            <select
              value={requirement.baseline ?? ''}
              onChange={(e) => onAssignBaseline(e.target.value || null)}
              className="h-7 w-full rounded-md border border-border bg-background px-2 text-xs"
            >
              <option value="">— 없음 —</option>
              {baselines.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} v{b.version}
                </option>
              ))}
            </select>
          </MetaField>
          <MetaField label="현재 베이스라인">{getBaselineLabel(requirement.baseline)}</MetaField>
        </div>

        <div className="mt-4">
          <SectionHeader title="설명" />
          {isEditing ? (
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-lg border border-border p-3 text-sm"
            />
          ) : (
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {requirement.description}
            </p>
          )}
        </div>

        <div className="mt-4">
          <SectionHeader title="수용 기준" />
          <ul className="mt-2 space-y-1.5">
            {requirement.acceptanceCriteria.map((c, i) => (
              <li key={i} className="flex gap-2 text-sm text-text-secondary">
                <span className="text-primary">•</span>
                {c}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5">
          <div className="flex items-start justify-between gap-3">
            <SectionHeader title="추적성" />
            <Badge variant="outline" className="shrink-0 text-[10px]">
              {traceabilitySource === 'api' ? 'traceability API 기반' : 'mock fallback'}
            </Badge>
          </div>
          <dl className="mt-3 space-y-2 text-sm">
            <TraceRow label="출처" value={trace.source || fallbackTrace.source || 'Manual Input'} />
            <TraceRow
              label="연결 문서"
              value={trace.linkedDocuments.join(', ') || '—'}
            />
            <TraceRow
              label="연결 코드"
              value={trace.linkedCodeFiles.join(', ') || '—'}
            />
            <TraceRow
              label="연결 빌드"
              value={trace.linkedBuilds.join(', ') || '—'}
            />
            <TraceRow
              label="연결 테스트"
              value={trace.linkedTests.join(', ') || '—'}
            />
            <TraceRow label="유사도" value={trace.similarityScore.toFixed(2)} />
            <TraceStatusRow status={trace.linkStatus} />
          </dl>
        </div>

        {requirement.tags && requirement.tags.length > 0 && (
          <div className="mt-5">
            <SectionHeader title="태그" />
            <div className="mt-2 flex flex-wrap gap-1">
              {requirement.tags.map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          </div>
        )}

        {showVersionCompare && reqVersions.length > 0 && (
          <div className="mt-5">
            <RequirementVersionCompare versions={reqVersions} />
          </div>
        )}

        {showHistory && reqVersions.length > 0 && (
          <div className="mt-5">
            <SectionHeader title="변경 이력" />
            <div className="mt-3 space-y-3">
              {reqVersions.map((v) => (
                <div key={v.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary">v{v.version}</span>
                    <span className="text-[10px] text-text-secondary">{formatDate(v.changedAt)}</span>
                  </div>
                  <p className="mt-1 text-xs font-medium text-text-primary">{v.changeSummary}</p>
                  <p className="mt-1 text-[11px] text-text-secondary">{v.currentContent}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {trace.linkedDocuments.length > 0 && (
          <div className="mt-5">
            <SectionHeader title="관련 문서" />
            <div className="mt-2 space-y-1">
              {trace.linkedDocuments.map((title) => (
                <div key={title} className="flex items-center gap-2 text-sm text-text-secondary">
                  <Target className="h-3 w-3" />
                  {title}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

function MetaField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">{label}</dt>
      <dd className="mt-0.5 text-text-primary">{children}</dd>
    </div>
  )
}

function TraceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-28 shrink-0 text-text-secondary">{label}</dt>
      <dd className="text-text-primary">{value}</dd>
    </div>
  )
}

function TraceStatusRow({ status }: { status: TraceabilityMatrixItem['linkStatus'] }) {
  return (
    <div className="flex gap-2">
      <dt className="w-28 shrink-0 text-text-secondary">상태</dt>
      <dd>
        <Badge
          variant={
            status === 'linked' ? 'success' : status === 'partial' ? 'warning' : 'outline'
          }
        >
          {status === 'linked' ? '연결됨' : status === 'partial' ? '부분 연결' : '미연결'}
        </Badge>
      </dd>
    </div>
  )
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  variant = 'default',
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  variant?: 'default' | 'danger'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-medium transition-colors',
        variant === 'danger'
          ? 'border-danger/30 text-danger hover:bg-danger/10'
          : 'border-border text-text-secondary hover:bg-gray-50',
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </button>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

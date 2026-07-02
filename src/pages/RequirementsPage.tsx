import { PageContainer } from '@/components/layout/PageContainer'
import {
  RequirementListPanel,
  RequirementDetailPanel,
  RequirementAnalysisPanel,
} from '@/components/requirements'
import { useRequirements } from '@/contexts/RequirementsContext'
import { useRequirementFilters } from '@/hooks/useRequirementFilters'
import { useWorkflow } from '@/hooks/useWorkflow'
import { useApp } from '@/contexts/AppContext'
import { recomputeValidationRequirement } from '@/api/client'
import { useState } from 'react'

export function RequirementsPage() {
  const workflow = useWorkflow()
  const {
    requirements,
    selectedId,
    setSelectedId,
    updateRequirement,
    updateStatus,
    assignBaseline,
    deleteRequirement,
    duplicateRequirement,
    getVersionsFor,
    apiConnected,
    refresh,
  } = useRequirements()
  const { activeProjectId } = useApp()
  const [recomputingId, setRecomputingId] = useState<string | null>(null)
  const [recomputeMessage, setRecomputeMessage] = useState<string | null>(null)

  const projectRequirements = requirements.filter((r) => r.projectId === activeProjectId)
  const selected = projectRequirements.find((r) => r.id === selectedId) ?? null

  const {
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    priorityFilter,
    setPriorityFilter,
    statusFilter,
    setStatusFilter,
    filtered,
  } = useRequirementFilters(projectRequirements)

  const handleRecompute = async () => {
    if (!selected) return
    setRecomputingId(selected.id)
    setRecomputeMessage(null)
    try {
      await recomputeValidationRequirement(selected.id)
      await refresh()
      setRecomputeMessage('재분석 완료')
    } catch {
      setRecomputeMessage(apiConnected ? '재분석 API 실패 · 기존 데이터 유지' : '오프라인 · mock fallback')
    } finally {
      setRecomputingId(null)
    }
  }

  return (
    <PageContainer
      title={workflow.title}
      showWorkflowBanner={false}
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden lg:grid-cols-[280px_1fr_280px]">
        <RequirementListPanel
          requirements={filtered}
          selectedId={selectedId}
          onSelect={setSelectedId}
          search={search}
          onSearchChange={setSearch}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        <RequirementDetailPanel
          requirement={selected}
          allRequirements={projectRequirements}
          apiConnected={apiConnected}
          versions={selected ? getVersionsFor(selected.id) : []}
          recomputing={recomputingId === selected?.id}
          recomputeMessage={recomputeMessage}
          onUpdateStatus={(status) => selected && updateStatus(selected.id, status)}
          onAssignBaseline={(baselineId) => selected && assignBaseline(selected.id, baselineId)}
          onDelete={() => {
            if (selected && confirm(`"${selected.title}" 요구사항을 삭제하시겠습니까?`)) {
              deleteRequirement(selected.id)
            }
          }}
          onDuplicate={() => selected && duplicateRequirement(selected.id)}
          onEdit={(patch) => selected && updateRequirement(selected.id, patch)}
          onRecompute={handleRecompute}
        />

        <RequirementAnalysisPanel
          requirement={selected}
          versions={selected ? getVersionsFor(selected.id) : []}
        />
      </div>
    </PageContainer>
  )
}

import { PageContainer } from '@/components/layout/PageContainer'
import {
  RequirementListPanel,
  RequirementDetailPanel,
  RequirementAnalysisPanel,
} from '@/components/requirements'
import { useRequirements } from '@/contexts/RequirementsContext'
import { useRequirementFilters } from '@/hooks/useRequirementFilters'
import { useWorkflow } from '@/hooks/useWorkflow'
import { currentProjectId } from '@/mocks'

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
  } = useRequirements()

  const projectRequirements = requirements.filter((r) => r.projectId === currentProjectId)
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
          versions={selected ? getVersionsFor(selected.id) : []}
          onUpdateStatus={(status) => selected && updateStatus(selected.id, status)}
          onAssignBaseline={(baselineId) => selected && assignBaseline(selected.id, baselineId)}
          onDelete={() => {
            if (selected && confirm(`"${selected.title}" 요구사항을 삭제하시겠습니까?`)) {
              deleteRequirement(selected.id)
            }
          }}
          onDuplicate={() => selected && duplicateRequirement(selected.id)}
          onEdit={(patch) => selected && updateRequirement(selected.id, patch)}
        />

        <RequirementAnalysisPanel
          requirement={selected}
          versions={selected ? getVersionsFor(selected.id) : []}
        />
      </div>
    </PageContainer>
  )
}

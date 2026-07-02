import { useState, useEffect } from 'react'
import { GitBranch, Sparkles } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/ui/SectionHeader'
import {
  ValidationListPanel,
  RelationshipGraph,
  ValidationDetailPanel,
  CodeAssociationSection,
} from '@/components/validation'
import { useRequirements } from '@/contexts/RequirementsContext'
import { useWorkflow } from '@/hooks/useWorkflow'
import { currentProjectId, getValidationDetail } from '@/mocks'
import { useValidationFilters, getSelectedValidation } from '@/hooks/useValidationFilters'

export function ValidationPage() {
  const workflow = useWorkflow()
  const { requirements } = useRequirements()
  const projectReqs = requirements.filter((r) => r.projectId === currentProjectId)

  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    scoreFilter,
    setScoreFilter,
    filtered,
  } = useValidationFilters(projectReqs)

  const [selectedId, setSelectedId] = useState<string | null>('REQ-001')
  const [selectedFile, setSelectedFile] = useState<string | null>('AuthController.java')

  const selected = getSelectedValidation(selectedId, projectReqs)
  const listItems = filtered.map(({ requirement, estimated, status }) => ({
    id: requirement.id,
    title: requirement.title,
    estimated,
    status,
  }))

  useEffect(() => {
    if (filtered.length > 0 && !filtered.some((f) => f.requirement.id === selectedId)) {
      const first = filtered[0].requirement.id
      setSelectedId(first)
      const detail = getValidationDetail(first)
      setSelectedFile(detail?.matches[0]?.displayName ?? null)
    }
  }, [filtered, selectedId])

  const handleSelect = (id: string) => {
    setSelectedId(id)
    const detail = getValidationDetail(id)
    setSelectedFile(detail?.matches[0]?.displayName ?? null)
  }

  return (
    <PageContainer
      title={workflow.title}
      description={workflow.subtitle}
      workflow={workflow}
      action={<Badge variant="success">검증 단계</Badge>}
    >
      <Card className="mb-5" padding="lg">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
            <GitBranch className="h-5 w-5 text-success" />
          </div>
          <div className="flex-1">
            <SectionHeader
              title="요구사항 ↔ 코드 의미적 검증"
              description="요구사항 임베딩과 코드 임베딩 코사인 유사도 기반 추정 구현 점수 산출"
            />
          </div>
          <Badge variant="outline">
            <Sparkles className="mr-1 h-3 w-3" />
            AI 추정
          </Badge>
        </div>
        <p className="mt-3 text-[11px] text-text-secondary">
          * 모든 점수는 추정 구현 점수(AI 추정치)이며, 실제 구현 완료를 보장하지 않습니다.
        </p>
      </Card>

      <div className="grid min-h-0 grid-cols-1 gap-4 lg:h-[calc(100vh-20rem)] lg:grid-cols-[240px_1fr_280px]">
        <ValidationListPanel
          items={listItems}
          selectedId={selectedId}
          onSelect={handleSelect}
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          scoreFilter={scoreFilter}
          onScoreFilterChange={setScoreFilter}
        />

        {selected ? (
          <>
            <RelationshipGraph
              requirement={selected.requirement}
              matches={selected.detail.matches}
              selectedFile={selectedFile}
              onSelectFile={setSelectedFile}
            />
            <ValidationDetailPanel
              requirement={selected.requirement}
              detail={selected.detail}
              estimated={selected.estimated}
              similarityAvg={selected.similarityAvg}
              status={selected.status}
            />
          </>
        ) : (
          <Card className="flex items-center justify-center lg:col-span-2">
            <p className="text-sm text-text-secondary">검증 데이터가 있는 요구사항을 선택하세요</p>
          </Card>
        )}
      </div>

      {selected && (
        <div className="mt-5">
          <CodeAssociationSection
            requirement={selected.requirement}
            matches={selected.detail.matches}
            selectedFile={selectedFile}
            onSelectFile={setSelectedFile}
          />
        </div>
      )}
    </PageContainer>
  )
}

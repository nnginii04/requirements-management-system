import { useMemo, useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Hammer } from 'lucide-react'
import {
  BuildSummaryCards,
  BuildTimelineChart,
  DateProgressChart,
  BuildHistoryTable,
  BuildDetailPanel,
  RequirementProgressTimeline,
} from '@/components/build'
import { useRequirements } from '@/contexts/RequirementsContext'
import { useWorkflow } from '@/hooks/useWorkflow'
import { getBuildHistoriesByProjectId, currentProjectId } from '@/mocks'
import {
  computeBuildSummary,
  enrichBuildsWithChange,
  filterBuildsByDateRange,
  getTimelineData,
  getDateProgressData,
} from '@/utils/buildHistory'

export function BuildHistoryPage() {
  const workflow = useWorkflow()
  const { requirements } = useRequirements()
  const projectReqs = requirements.filter((r) => r.projectId === currentProjectId)
  const allBuilds = getBuildHistoriesByProjectId(currentProjectId)

  const [selectedBuildNumber, setSelectedBuildNumber] = useState<number | null>(
    allBuilds[0]?.buildNumber ?? null,
  )
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [buildFilter, setBuildFilter] = useState<number | 'all'>('all')
  const [selectedReqId, setSelectedReqId] = useState('REQ-001')

  const filteredBuilds = useMemo(() => {
    let builds = filterBuildsByDateRange(allBuilds, dateFrom || undefined, dateTo || undefined)
    if (buildFilter !== 'all') {
      builds = builds.filter((b) => b.buildNumber === buildFilter)
    }
    return enrichBuildsWithChange(builds)
  }, [allBuilds, dateFrom, dateTo, buildFilter])

  const summary = computeBuildSummary(allBuilds)
  const timelineData = getTimelineData(
    buildFilter === 'all' ? allBuilds : allBuilds.filter((b) => b.buildNumber === buildFilter),
  )
  const dateProgressData = getDateProgressData(allBuilds)

  const selectedBuild = filteredBuilds.find((b) => b.buildNumber === selectedBuildNumber) ?? null
  const selectedReq = projectReqs.find((r) => r.id === selectedReqId)

  if (!summary) {
    return (
      <PageContainer title={workflow.title} description={workflow.subtitle} workflow={workflow}>
        <Card><p className="text-sm text-text-secondary">빌드 데이터가 없습니다.</p></Card>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title={workflow.title}
      description={workflow.subtitle}
      workflow={workflow}
      action={<Badge variant="outline">추적 단계</Badge>}
    >
      <Card className="mb-5" padding="lg">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Hammer className="h-5 w-5 text-primary" />
          </div>
          <SectionHeader
            title="Jenkins 빌드 ↔ 요구사항 진척"
            description="빌드 시점 코드 스냅샷 분석 → 요구사항별 추정 구현 점수 재계산 → 진척 타임라인 저장"
          />
        </div>
        <p className="mt-3 text-[11px] text-text-secondary">
          진척 변화 = 현재 빌드 추정 진척률 − 이전 빌드 추정 진척률 · 예: 빌드 #148 (~79%) → #149 (~84%) = +5%
        </p>
      </Card>

      <BuildSummaryCards summary={summary} />

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <BuildTimelineChart data={timelineData} selectedBuild={selectedBuildNumber} />
        <DateProgressChart data={dateProgressData} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BuildHistoryTable
            builds={filteredBuilds}
            selectedBuildNumber={selectedBuildNumber}
            onSelect={setSelectedBuildNumber}
          />
        </div>
        <BuildDetailPanel build={selectedBuild} />
      </div>

      <div className="mt-8">
        <SectionHeader
          title="진척 타임라인"
          description="요구사항별 빌드 스냅샷 · 추정 구현 점수 증감 추이"
          className="mb-4"
        />

        <Card className="mb-4 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">시작일</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="field-input" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">종료일</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="field-input" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-secondary">빌드 필터</label>
              <select
                value={buildFilter}
                onChange={(e) => setBuildFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="field-input"
              >
                <option value="all">전체 빌드</option>
                {allBuilds.map((b) => (
                  <option key={b.id} value={b.buildNumber}>빌드 #{b.buildNumber}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1 block text-xs font-medium text-text-secondary">요구사항 필터</label>
            <select
              value={selectedReqId}
              onChange={(e) => setSelectedReqId(e.target.value)}
              className="field-input max-w-md"
            >
              {projectReqs.map((r) => (
                <option key={r.id} value={r.id}>{r.id} — {r.title}</option>
              ))}
            </select>
          </div>
        </Card>

        {selectedReq && (
          <RequirementProgressTimeline
            requirementId={selectedReq.id}
            requirementTitle={selectedReq.title}
          />
        )}
      </div>
    </PageContainer>
  )
}

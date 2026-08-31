import { type ReactNode } from 'react'
import { GitCommit, FileCode2, ListChecks, AlertOctagon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Badge } from '@/components/ui/Badge'
import { BuildStatusLabel, ProgressDelta, getTestResultLabel } from './buildStatus'
import type { EnrichedBuild } from './BuildHistoryTable'

interface BuildDetailPanelProps {
  build: EnrichedBuild | null
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <span className="shrink-0 text-xs text-text-secondary">{label}</span>
      <span className="min-w-0 text-right text-xs text-text-primary">{children}</span>
    </div>
  )
}

function IdList({
  icon: Icon,
  title,
  ids,
  emptyText,
}: {
  icon: typeof GitCommit
  title: string
  ids: string[]
  emptyText: string
}) {
  return (
    <div className="mt-4">
      <p className="flex items-center gap-1.5 text-xs font-medium text-text-primary">
        <Icon className="h-3.5 w-3.5 text-text-secondary" aria-hidden />
        {title}
      </p>
      {ids.length === 0 ? (
        <p className="mt-1.5 text-[11px] text-text-secondary">{emptyText}</p>
      ) : (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {ids.map((id) => (
            <Badge key={id} variant="outline" className="font-mono text-[10px]">
              {id}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

export function BuildDetailPanel({ build }: BuildDetailPanelProps) {
  if (!build) {
    return (
      <Card className="h-full">
        <SectionHeader title="빌드 상세" description="좌측 표에서 빌드를 선택하세요" />
        <p className="mt-8 text-sm text-text-secondary">선택된 빌드가 없습니다.</p>
      </Card>
    )
  }

  const testRatio = build.testTotal > 0 ? Math.round((build.testPassed / build.testTotal) * 100) : 0

  return (
    <Card className="h-full">
      <div className="flex items-start justify-between gap-3">
        <SectionHeader title={`빌드 #${build.buildNumber}`} description={build.commitMessage} />
        <BuildStatusLabel status={build.status} className="shrink-0" />
      </div>

      <div className="mt-4 divide-y divide-border/60">
        <Row label="브랜치">{build.branch}</Row>
        <Row label="커밋">
          <span className="inline-flex items-center gap-1 font-mono">
            <GitCommit className="h-3 w-3 text-text-secondary" aria-hidden />
            {build.commitId.slice(0, 10)}
          </span>
        </Row>
        <Row label="소요 시간">{build.duration}</Row>
        <Row label="추정 진척률">
          ~{build.requirementProgress}% <ProgressDelta value={build.computedChange} className="ml-1" />
        </Row>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-secondary">
            테스트 · {getTestResultLabel(build.testResult)}
          </span>
          <span className="font-medium text-text-primary">
            {build.testPassed}/{build.testTotal} ({testRatio}%)
          </span>
        </div>
        <div
          className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100"
          role="progressbar"
          aria-valuenow={testRatio}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="테스트 통과율"
        >
          <div className="h-full rounded-full bg-primary" style={{ width: `${testRatio}%` }} />
        </div>
      </div>

      <IdList
        icon={ListChecks}
        title="영향받은 요구사항"
        ids={build.changedRequirements}
        emptyText="변경된 요구사항 없음"
      />
      <IdList
        icon={AlertOctagon}
        title="실패한 요구사항"
        ids={build.failedRequirements}
        emptyText="실패 없음"
      />
      <IdList
        icon={FileCode2}
        title="관련 파일"
        ids={build.relatedFiles}
        emptyText="관련 파일 정보 없음"
      />
    </Card>
  )
}

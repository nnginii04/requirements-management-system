import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { cn } from '@/utils/cn'
import type { BuildHistory } from '@/types'
import { BuildStatusLabel, ProgressDelta } from './buildStatus'

export type EnrichedBuild = BuildHistory & { computedChange: number }

interface BuildHistoryTableProps {
  builds: EnrichedBuild[]
  selectedBuildNumber: number | null
  onSelect: (buildNumber: number) => void
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function BuildHistoryTable({ builds, selectedBuildNumber, onSelect }: BuildHistoryTableProps) {
  return (
    <Card className="h-full" padding="sm">
      <div className="px-2 pt-2">
        <SectionHeader title="빌드 이력" description="행을 선택하면 우측에 상세가 표시됩니다" />
      </div>

      {builds.length === 0 ? (
        <p className="px-2 py-8 text-sm text-text-secondary">조건에 맞는 빌드가 없습니다.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-text-secondary">
                <th scope="col" className="px-3 py-2 font-medium">빌드</th>
                <th scope="col" className="px-3 py-2 font-medium">상태</th>
                <th scope="col" className="px-3 py-2 font-medium">커밋</th>
                <th scope="col" className="px-3 py-2 font-medium">테스트</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">진척률</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">변화</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">시각</th>
              </tr>
            </thead>
            <tbody>
              {builds.map((build) => {
                const isSelected = build.buildNumber === selectedBuildNumber
                return (
                  <tr
                    key={build.id}
                    onClick={() => onSelect(build.buildNumber)}
                    tabIndex={0}
                    role="button"
                    aria-pressed={isSelected}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onSelect(build.buildNumber)
                      }
                    }}
                    className={cn(
                      'cursor-pointer border-b border-border/60 transition-colors last:border-0',
                      isSelected ? 'bg-primary/5' : 'hover:bg-gray-50',
                    )}
                  >
                    <td className="px-3 py-2.5">
                      <span className="flex items-center gap-2">
                        <span
                          className={cn('h-4 w-0.5 shrink-0 rounded-full', isSelected ? 'bg-primary' : 'bg-transparent')}
                          aria-hidden
                        />
                        <span className="font-medium text-text-primary">#{build.buildNumber}</span>
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <BuildStatusLabel status={build.status} />
                    </td>
                    <td className="max-w-[220px] px-3 py-2.5">
                      <p className="truncate text-xs text-text-primary" title={build.commitMessage}>
                        {build.commitMessage}
                      </p>
                      <p className="text-[11px] text-text-secondary">
                        {build.branch} · {build.commitId.slice(0, 7)}
                      </p>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-text-secondary">
                      {build.testPassed}/{build.testTotal}
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs font-medium text-text-primary">
                      ~{build.requirementProgress}%
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <ProgressDelta value={build.computedChange} className="justify-end" />
                    </td>
                    <td className="px-3 py-2.5 text-right text-[11px] text-text-secondary">
                      {formatDate(build.createdAt)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

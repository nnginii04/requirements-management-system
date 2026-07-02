import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { Requirement } from '@/types'
import type { TraceabilityMatrixItem } from '@/api/types'
import type { CodeMatchDetail } from '@/utils/validation'
import { getConnectionColor } from '@/utils/validation'
import { cn } from '@/utils/cn'

type AssociationTab = 'graph' | 'tree' | 'matrix' | 'file'
type TraceabilitySource = 'api' | 'fallback_mock'

interface CodeAssociationSectionProps {
  requirement: Requirement
  matches: CodeMatchDetail[]
  selectedFile: string | null
  onSelectFile: (name: string) => void
  traceabilitySource?: TraceabilitySource
  traceabilityItems?: TraceabilityMatrixItem[]
}

export function CodeAssociationSection({
  requirement,
  matches,
  selectedFile,
  onSelectFile,
  traceabilitySource = 'fallback_mock',
  traceabilityItems = [],
}: CodeAssociationSectionProps) {
  const [tab, setTab] = useState<AssociationTab>('matrix')
  const visible = matches.filter((m) => m.score >= 0.4)
  const selected = visible.find((m) => m.displayName === selectedFile) ?? visible[0]

  const tabs: { id: AssociationTab; label: string }[] = [
    { id: 'graph', label: '노드 그래프' },
    { id: 'tree', label: '트리 뷰' },
    { id: 'matrix', label: '추적성 매트릭스' },
    { id: 'file', label: '파일 상세' },
  ]

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="border-b border-border px-4 py-3">
        <SectionHeader
          title="코드 연관도"
          description="요구사항 ↔ 코드 파일 ↔ 클래스/함수 연결 관계"
        />
        <div className="mt-3 flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                tab === t.id ? 'bg-primary text-white' : 'bg-gray-100 text-text-secondary hover:bg-gray-200',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-0 lg:grid-cols-3">
        <div className={cn('border-border p-4', tab === 'file' ? 'lg:col-span-2' : 'lg:col-span-3')}>
          {tab === 'graph' && <NodeGraphView requirement={requirement} matches={visible} />}
          {tab === 'tree' && (
            <TreeView
              requirement={requirement}
              matches={visible}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
            />
          )}
          {tab === 'matrix' && (
            <div>
              <Badge variant="outline" className="mb-3 text-[10px]">
                {traceabilitySource === 'api'
                  ? 'traceability API 기반'
                  : 'mock fallback · traceability 데이터 대체 표시'}
              </Badge>
              <TraceabilityMatrix requirement={requirement} matches={visible} items={traceabilityItems} />
            </div>
          )}
          {tab === 'file' && selected && <FileDetailPanel match={selected} />}
        </div>
        {tab !== 'file' && selected && (
          <div className="border-t border-border p-4 lg:border-l lg:border-t-0">
            <FileDetailPanel match={selected} compact />
          </div>
        )}
      </div>
    </Card>
  )
}

function NodeGraphView({
  requirement,
  matches,
}: {
  requirement: Requirement
  matches: CodeMatchDetail[]
}) {
  return (
    <div className="space-y-2">
      <div className="rounded-lg border-2 border-primary/30 bg-primary/5 px-4 py-3">
        <p className="font-semibold text-primary">{requirement.id} {requirement.title}</p>
      </div>
      {matches.map((m) => (
        <div key={m.displayName} className="ml-6 flex items-center gap-3">
          <div className="h-px w-6 bg-border" />
          <div
            className="flex flex-1 items-center justify-between rounded-lg border px-3 py-2"
            style={{ borderColor: getConnectionColor(m.score) }}
          >
            <span className="font-mono text-sm">{m.displayName}</span>
            <Badge variant="primary">{(m.score * 100).toFixed(0)}%</Badge>
          </div>
        </div>
      ))}
    </div>
  )
}

function TreeView({
  requirement,
  matches,
  selectedFile,
  onSelectFile,
}: {
  requirement: Requirement
  matches: CodeMatchDetail[]
  selectedFile: string | null
  onSelectFile: (name: string) => void
}) {
  return (
    <div className="font-mono text-xs">
      <div className="font-semibold text-primary">📋 {requirement.id}</div>
      {matches.map((m) => (
        <div key={m.displayName} className="ml-4 mt-2">
          <button
            type="button"
            onClick={() => onSelectFile(m.displayName)}
            className={cn(
              'text-left hover:text-primary',
              selectedFile === m.displayName && 'font-bold text-primary',
            )}
          >
            └ 📄 {m.displayName} <span className="text-text-secondary">({(m.score * 100).toFixed(0)}%)</span>
          </button>
          {m.classes.map((c) => (
            <div key={c} className="ml-4 text-text-secondary">└ 🏛 {c}</div>
          ))}
          {m.functions.map((f) => (
            <div key={f.name} className="ml-8 text-text-secondary">
              └ ƒ {f.name} ({(f.score * 100).toFixed(0)}%)
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function TraceabilityMatrix({
  requirement,
  matches,
  items,
}: {
  requirement: Requirement
  matches: CodeMatchDetail[]
  items: TraceabilityMatrixItem[]
}) {
  const fallbackRow = {
    requirementId: requirement.id,
    requirementTitle: requirement.title,
    linkedDocuments: [],
    linkedCodeFiles: matches.map((m) => m.displayName),
    linkedBuilds: matches.map((m) => `Build #${m.buildNumber}`),
    linkedTests: matches.map((m) => m.testCase).filter(Boolean) as string[],
    similarityScore:
      matches.length > 0
        ? Math.round((matches.reduce((sum, match) => sum + match.score, 0) / matches.length) * 100) / 100
        : 0,
    linkStatus: matches.some((m) => m.status === 'linked') ? 'linked' : matches.length > 0 ? 'partial' : 'missing',
  }
  const rows = items.length > 0 ? items : [fallbackRow]

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-border text-[10px] uppercase text-text-secondary">
            <th className="px-3 py-2">Requirement</th>
            <th className="px-3 py-2">Document</th>
            <th className="px-3 py-2">Code File</th>
            <th className="px-3 py-2">Test Case</th>
            <th className="px-3 py-2">Build</th>
            <th className="px-3 py-2">Similarity</th>
            <th className="px-3 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.requirementId} className="border-b border-border hover:bg-gray-50">
              <td className="px-3 py-2 font-medium">{row.requirementId}</td>
              <td className="px-3 py-2 text-text-secondary">{row.linkedDocuments.join(', ') || '—'}</td>
              <td className="px-3 py-2 font-mono">{row.linkedCodeFiles.join(', ') || '—'}</td>
              <td className="px-3 py-2 text-text-secondary">{row.linkedTests.join(', ') || '—'}</td>
              <td className="px-3 py-2">{row.linkedBuilds.join(', ') || '—'}</td>
              <td className="px-3 py-2 font-semibold text-primary">{row.similarityScore.toFixed(2)}</td>
              <td className="px-3 py-2">
                <Badge variant={row.linkStatus === 'linked' ? 'success' : row.linkStatus === 'partial' ? 'warning' : 'outline'}>
                  {row.linkStatus === 'linked' ? '연결됨' : row.linkStatus === 'partial' ? '부분' : '미연결'}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FileDetailPanel({
  match,
  compact = false,
}: {
  match: CodeMatchDetail
  compact?: boolean
}) {
  return (
    <div>
      <p className="font-mono text-sm font-semibold text-text-primary">{match.displayName}</p>
      <p className="text-[10px] text-text-secondary">{match.path}</p>
      {!compact && (
        <p className="mt-2 text-xs text-text-secondary">{match.reason}</p>
      )}
      <dl className="mt-3 space-y-2 text-xs">
        <div className="flex justify-between">
          <dt className="text-text-secondary">유사도</dt>
          <dd className="font-bold text-primary">{match.score.toFixed(2)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-text-secondary">빌드</dt>
          <dd>#{match.buildNumber}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-text-secondary">커밋</dt>
          <dd className="font-mono">{match.commitId}</dd>
        </div>
        {match.testCase && (
          <div className="flex justify-between">
            <dt className="text-text-secondary">테스트</dt>
            <dd>{match.testCase}</dd>
          </div>
        )}
      </dl>
      <div className="mt-3">
        <p className="text-[10px] font-medium uppercase text-text-secondary">함수</p>
        <ul className="mt-1 space-y-1">
          {match.functions.map((f) => (
            <li key={f.name} className="flex justify-between font-mono text-[10px]">
              <span>{f.name}</span>
              <span className="text-primary">{(f.score * 100).toFixed(0)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

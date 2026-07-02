import { useState } from 'react'
import type { RequirementVersion } from '@/types'
import { getUserById } from '@/mocks'
import { SectionHeader } from '@/components/ui/SectionHeader'

interface RequirementVersionCompareProps {
  versions: RequirementVersion[]
}

export function RequirementVersionCompare({ versions }: RequirementVersionCompareProps) {
  const sorted = [...versions].sort((a, b) => b.version.localeCompare(a.version))
  const [leftId, setLeftId] = useState(sorted[1]?.id ?? sorted[0]?.id ?? '')
  const [rightId, setRightId] = useState(sorted[0]?.id ?? '')

  const left = versions.find((v) => v.id === leftId)
  const right = versions.find((v) => v.id === rightId)

  if (!left || !right) return null

  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <SectionHeader title="버전 비교" description="이전 버전과 현재 버전을 비교합니다" />
      <div className="mt-3 grid grid-cols-2 gap-3">
        <VersionSelect
          label="이전"
          versions={versions}
          value={leftId}
          onChange={setLeftId}
        />
        <VersionSelect
          label="현재"
          versions={versions}
          value={rightId}
          onChange={setRightId}
        />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <VersionBlock version={left} />
        <VersionBlock version={right} highlight />
      </div>
    </div>
  )
}

function VersionSelect({
  label,
  versions,
  value,
  onChange,
}: {
  label: string
  versions: RequirementVersion[]
  value: string
  onChange: (id: string) => void
}) {
  return (
    <div>
      <label className="text-[10px] font-medium text-text-secondary">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-8 w-full rounded-md border border-border bg-card px-2 text-xs"
      >
        {versions.map((v) => (
          <option key={v.id} value={v.id}>v{v.version}</option>
        ))}
      </select>
    </div>
  )
}

function VersionBlock({
  version,
  highlight = false,
}: {
  version: RequirementVersion
  highlight?: boolean
}) {
  const user = getUserById(version.changedBy)
  return (
    <div className={`rounded-lg border p-3 ${highlight ? 'border-primary/30 bg-primary/5' : 'border-border'}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold">v{version.version}</span>
        <span className="text-[10px] text-text-secondary">{user?.name}</span>
      </div>
      <p className="mt-2 text-[11px] font-medium text-text-primary">{version.changeSummary}</p>
      <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-text-secondary">
        {version.currentContent}
      </p>
    </div>
  )
}

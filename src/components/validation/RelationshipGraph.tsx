import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { Requirement } from '@/types'
import type { CodeMatchDetail } from '@/utils/validation'
import {
  getConnectionColor,
  getConnectionStrength,
  getConnectionStrokeWidth,
} from '@/utils/validation'

interface RelationshipGraphProps {
  requirement: Requirement
  matches: CodeMatchDetail[]
  selectedFile: string | null
  onSelectFile: (displayName: string) => void
}

export function RelationshipGraph({
  requirement,
  matches,
  selectedFile,
  onSelectFile,
}: RelationshipGraphProps) {
  const visible = matches.filter((m) => m.score >= 0.4)

  return (
    <Card padding="none" className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-border px-4 py-3">
        <SectionHeader
          title="요구사항-코드 관계 그래프"
          description="코사인 유사도 기반 의미적 연결 · 연결 강도 = 유사도"
        />
      </div>

      <div className="flex-1 overflow-auto p-4">
        <svg viewBox="0 0 700 420" className="mx-auto w-full max-w-3xl" style={{ minHeight: 360 }}>
          {/* Requirement node (center-left) */}
          <g transform="translate(80, 180)">
            <rect
              x={-70}
              y={-36}
              width={140}
              height={72}
              rx={12}
              fill="#0064FF"
              fillOpacity={0.1}
              stroke="#0064FF"
              strokeWidth={2}
            />
            <text textAnchor="middle" y={-8} className="fill-primary text-[11px] font-bold">
              {requirement.id}
            </text>
            <text textAnchor="middle" y={12} className="fill-text-primary text-[10px]">
              {requirement.title.length > 14
                ? `${requirement.title.slice(0, 14)}…`
                : requirement.title}
            </text>
          </g>

          {/* Code file nodes */}
          {visible.map((match, i) => {
            const y = 40 + i * 72
            const strength = getConnectionStrength(match.score)
            const strokeW = getConnectionStrokeWidth(strength)
            const color = getConnectionColor(match.score)
            const selected = selectedFile === match.displayName

            return (
              <g key={`${match.displayName}-${i}`}>
                <line
                  x1={150}
                  y1={180}
                  x2={380}
                  y2={y + 24}
                  stroke={color}
                  strokeWidth={strokeW}
                  strokeOpacity={0.7}
                  strokeDasharray={strength === 'weak' ? '4 4' : undefined}
                />
                <text
                  x={265}
                  y={(180 + y + 24) / 2 - 4}
                  textAnchor="middle"
                  className="fill-text-secondary text-[9px]"
                >
                  {(match.score * 100).toFixed(0)}%
                </text>

                <g
                  transform={`translate(380, ${y})`}
                  className="cursor-pointer"
                  onClick={() => onSelectFile(match.displayName)}
                >
                  <rect
                    x={0}
                    y={0}
                    width={280}
                    height={48}
                    rx={8}
                    fill={selected ? '#0064FF' : '#FFFFFF'}
                    fillOpacity={selected ? 0.12 : 1}
                    stroke={selected ? '#0064FF' : '#E5E7EB'}
                    strokeWidth={selected ? 2 : 1}
                  />
                  <text x={12} y={18} className="fill-text-primary text-[11px] font-mono font-medium">
                    {match.displayName}
                  </text>
                  <text x={12} y={34} className="fill-text-secondary text-[9px]">
                    {match.classes.join(', ') || '—'} · Build #{match.buildNumber}
                  </text>
                  <text x={250} y={28} textAnchor="end" className="fill-primary text-[11px] font-bold">
                    {(match.score * 100).toFixed(0)}%
                  </text>
                </g>

                {/* Function sub-nodes */}
                {match.functions.slice(0, 2).map((fn, fi) => (
                  <g key={fn.name} transform={`translate(400, ${y + 52 + fi * 18})`}>
                    <line x1={-20} y1={-28 + fi * 18} x2={0} y2={0} stroke="#E5E7EB" strokeWidth={1} />
                    <circle cx={4} cy={4} r={3} fill="#4F46E5" fillOpacity={0.5} />
                    <text x={14} y={8} className="fill-text-secondary text-[8px] font-mono">
                      {fn.name} ({(fn.score * 100).toFixed(0)}%)
                    </text>
                  </g>
                ))}
              </g>
            )
          })}
        </svg>

        <div className="mt-4 flex flex-wrap justify-center gap-4 text-[10px] text-text-secondary">
          <LegendItem color="#22C55E" label="≥85% 강함" width={3} />
          <LegendItem color="#0064FF" label="70-84% 보통" width={2} />
          <LegendItem color="#F59E0B" label="40-69% 약함" width={1} dashed />
          <span>&lt;40% 숨김</span>
        </div>
      </div>
    </Card>
  )
}

function LegendItem({
  color,
  label,
  width,
  dashed,
}: {
  color: string
  label: string
  width: number
  dashed?: boolean
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg width={24} height={8}>
        <line
          x1={0}
          y1={4}
          x2={24}
          y2={4}
          stroke={color}
          strokeWidth={width}
          strokeDasharray={dashed ? '3 2' : undefined}
        />
      </svg>
      {label}
    </span>
  )
}

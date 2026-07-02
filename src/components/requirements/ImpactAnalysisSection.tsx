import { useEffect, useState } from 'react'
import { AlertTriangle, FileCode, GitBranch, Hammer, Link2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { fetchImpact } from '@/api/client'
import type { ImpactAnalysis } from '@/api/types'

interface ImpactAnalysisSectionProps {
  requirementId: string
}

export function ImpactAnalysisSection({ requirementId }: ImpactAnalysisSectionProps) {
  const [impact, setImpact] = useState<ImpactAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchImpact(requirementId)
      .then((data) => {
        if (!cancelled) {
          setImpact(data)
          setError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(String(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [requirementId])

  if (loading) {
    return (
      <section>
        <SectionHeader title="변경 영향 분석" />
        <p className="mt-2 text-xs text-text-secondary">분석 중…</p>
      </section>
    )
  }

  if (error || !impact) {
    return (
      <section>
        <SectionHeader title="변경 영향 분석" />
        <p className="mt-2 text-xs text-text-secondary">영향 분석 데이터를 불러올 수 없습니다.</p>
      </section>
    )
  }

  const total =
    impact.documents.length +
    impact.codeFiles.length +
    impact.tests.length +
    impact.builds.length +
    impact.affectedRequirements.length

  return (
    <section>
      <SectionHeader
        title="변경 영향 분석"
        description={`이 요구사항 변경 시 ${total}개 항목에 영향`}
      />
      <div className="mt-3 space-y-2">
        <ImpactRow icon={FileCode} label="문서" items={impact.documents} />
        <ImpactRow icon={GitBranch} label="코드 파일" items={impact.codeFiles} mono />
        <ImpactRow icon={AlertTriangle} label="테스트" items={impact.tests} />
        <ImpactRow icon={Hammer} label="빌드" items={impact.builds.map((b) => `#${b}`)} />
        <ImpactRow icon={Link2} label="연관 요구사항" items={impact.affectedRequirements} />
      </div>
    </section>
  )
}

function ImpactRow({
  icon: Icon,
  label,
  items,
  mono = false,
}: {
  icon: typeof FileCode
  label: string
  items: string[]
  mono?: boolean
}) {
  if (items.length === 0) return null

  return (
    <Card className="p-3">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-text-secondary" />
        <span className="text-xs font-medium text-text-primary">{label}</span>
        <Badge variant="outline">{items.length}</Badge>
      </div>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <li
            key={item}
            className={`rounded-md bg-background px-2 py-0.5 text-[10px] text-text-secondary ${mono ? 'font-mono' : ''}`}
          >
            {item}
          </li>
        ))}
      </ul>
    </Card>
  )
}

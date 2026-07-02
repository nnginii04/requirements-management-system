import {
  FileText,
  Shield,
  Copy,
  AlertTriangle,
  FileQuestion,
  Link2,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import type { AnalysisSummary } from '@/utils/analysis'

interface AnalysisSummaryCardsProps {
  summary: AnalysisSummary
}

const cards = (summary: AnalysisSummary) => [
  {
    icon: FileText,
    label: '기능 요구사항',
    value: summary.functionalCount,
    accent: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Shield,
    label: '비기능 요구사항',
    value: summary.nonFunctionalCount,
    accent: 'text-secondary',
    bg: 'bg-secondary/10',
  },
  {
    icon: Copy,
    label: '중복 후보',
    value: summary.duplicateCandidates,
    accent: 'text-warning',
    bg: 'bg-warning/10',
  },
  {
    icon: AlertTriangle,
    label: '충돌 후보',
    value: summary.conflictCandidates,
    accent: 'text-danger',
    bg: 'bg-danger/10',
  },
  {
    icon: FileQuestion,
    label: '누락 요구사항',
    value: summary.missingRequirements,
    accent: 'text-danger',
    bg: 'bg-danger/10',
  },
  {
    icon: Link2,
    label: '추적성 갭',
    value: summary.traceabilityGaps,
    accent: 'text-primary',
    bg: 'bg-primary/10',
  },
]

export function AnalysisSummaryCards({ summary }: AnalysisSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {cards(summary).map((card) => (
        <Card key={card.label} padding="sm" className="p-3">
          <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${card.bg}`}>
            <card.icon className={`h-4 w-4 ${card.accent}`} />
          </div>
          <p className="text-2xl font-bold text-text-primary">{card.value}</p>
          <p className="mt-0.5 text-[10px] leading-tight text-text-secondary">{card.label}</p>
        </Card>
      ))}
    </div>
  )
}

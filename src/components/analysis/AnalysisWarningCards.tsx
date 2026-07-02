import { AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { AnalysisFinding } from '@/types'
import { getFindingTypeLabel } from '@/utils/analysis'

interface AnalysisWarningCardsProps {
  findings: AnalysisFinding[]
}

export function AnalysisWarningCards({ findings }: AnalysisWarningCardsProps) {
  const critical = findings.filter((f) => f.severity === 'critical' || f.severity === 'high')

  if (critical.length === 0) return null

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {critical.slice(0, 4).map((f) => (
        <Card key={f.id} className="border-warning/30 bg-warning/5">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-warning/10">
              <AlertTriangle className="h-4 w-4 text-warning" />
            </div>
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2">
                <Badge variant="warning">{getFindingTypeLabel(f.type)}</Badge>
                <span className="font-mono text-[10px] text-text-secondary">
                  {f.requirementIds.join(' / ')}
                </span>
              </div>
              <p className="line-clamp-2 text-xs text-text-primary">{f.description}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

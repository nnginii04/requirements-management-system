import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import type { WorkflowConfig } from '@/config/workflow'
import { lifecycleSteps } from '@/mocks/data/lifecycle'

interface WorkflowBannerProps {
  workflow: WorkflowConfig
}

export function WorkflowBanner({ workflow }: WorkflowBannerProps) {
  const stageLabel = lifecycleSteps.find((s) => s.id === workflow.stage)?.label

  return (
    <div className="mb-3 rounded-xl border border-border bg-card px-4 py-2 shadow-card sm:px-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <Badge variant="primary">
              <Sparkles className="mr-1 h-3 w-3" />
              요구사항 엔지니어링
            </Badge>
            {stageLabel && (
              <Badge variant="outline">{stageLabel} 단계</Badge>
            )}
          </div>
          <p className="text-sm text-text-secondary">{workflow.subtitle}</p>
        </div>
        {workflow.nextStep && (
          <Link
            to={workflow.nextStep.path}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {workflow.nextStep.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {workflow.keywords.map((kw) => (
          <span
            key={kw}
            className="rounded-md bg-background px-2 py-0.5 text-[10px] font-medium text-text-secondary ring-1 ring-border"
          >
            {kw}
          </span>
        ))}
      </div>
    </div>
  )
}

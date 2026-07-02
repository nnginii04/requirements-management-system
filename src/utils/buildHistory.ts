import type { BuildHistory } from '@/types'
import { buildHistories } from '@/mocks/data/buildHistories'
import { calculateProgressChange } from '@/utils/requirement'

export interface BuildSummary {
  latestBuild: BuildHistory
  successRate: number
  averageProgress: number
  lastUpdated: string
  totalBuilds: number
}

export function computeBuildSummary(builds: BuildHistory[]): BuildSummary | null {
  if (builds.length === 0) return null

  const sorted = [...builds].sort((a, b) => b.buildNumber - a.buildNumber)
  const latest = sorted[0]
  const successCount = builds.filter((b) => b.status === 'success').length
  const avgProgress = Math.round(
    builds.reduce((s, b) => s + b.requirementProgress, 0) / builds.length,
  )

  return {
    latestBuild: latest,
    successRate: Math.round((successCount / builds.length) * 100),
    averageProgress: avgProgress,
    lastUpdated: latest.createdAt,
    totalBuilds: builds.length,
  }
}

export function enrichBuildsWithChange(builds: BuildHistory[]): (BuildHistory & { computedChange: number })[] {
  const sorted = [...builds].sort((a, b) => b.buildNumber - a.buildNumber)
  return sorted.map((build, index) => {
    const previous = sorted[index + 1]
    const computedChange = previous
      ? calculateProgressChange(build.requirementProgress, previous.requirementProgress)
      : build.progressChange
    return { ...build, computedChange }
  })
}

export function filterBuildsByDateRange(
  builds: BuildHistory[],
  from?: string,
  to?: string,
): BuildHistory[] {
  return builds.filter((b) => {
    const date = b.createdAt.slice(0, 10)
    if (from && date < from) return false
    if (to && date > to) return false
    return true
  })
}

export function getTimelineData(builds: BuildHistory[]) {
  return [...builds]
    .sort((a, b) => a.buildNumber - b.buildNumber)
    .map((b) => ({
      buildNumber: b.buildNumber,
      label: `#${b.buildNumber}`,
      progress: b.requirementProgress,
      date: new Date(b.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
      status: b.status,
    }))
}

export function getDateProgressData(builds: BuildHistory[]) {
  const byDate = new Map<string, number>()
  const sorted = [...builds].sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  for (const b of sorted) {
    const date = new Date(b.createdAt).toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
    })
    byDate.set(date, b.requirementProgress)
  }

  return Array.from(byDate.entries()).map(([date, progress]) => ({ date, progress }))
}

export function getAllBuildNumbers(): number[] {
  return buildHistories.map((b) => b.buildNumber).sort((a, b) => a - b)
}

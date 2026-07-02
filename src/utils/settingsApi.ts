import type { Baseline } from '@/types'
import type { IntegrationStatus, ProjectView } from '@/api/types'
import {
  fetchBaselines,
  fetchIntegrations,
  fetchProject,
} from '@/api/client'
import { getBaselinesByProjectId } from '@/mocks'
import { projects, currentProjectId } from '@/mocks/data/projects'
import { requirements } from '@/mocks/data/requirements'
import { users } from '@/mocks/data/users'
import { calculateOverallProgress } from '@/utils/requirement'

const mockIntegrations: IntegrationStatus = {
  jenkins: { connected: true, label: '설정됨 (목업)' },
  git: { connected: true, label: '연결됨 (목업)' },
  aiEngine: { connected: true, label: '활성' },
}

function mockProjectView(projectId: string): ProjectView {
  const base = projects.find((p) => p.id === projectId) ?? projects[0]
  const reqs = requirements.filter((r) => r.projectId === projectId)
  return {
    ...base,
    totalRequirements: reqs.length,
    memberCount: users.length,
    progress: calculateOverallProgress(reqs),
  }
}

export interface SettingsData {
  project: ProjectView
  baselines: Baseline[]
  integrations: IntegrationStatus
}

export async function loadSettingsData(
  projectId: string,
  apiConnected: boolean,
): Promise<SettingsData> {
  if (apiConnected) {
    try {
      const [project, baselines, integrations] = await Promise.all([
        fetchProject(projectId),
        fetchBaselines(projectId),
        fetchIntegrations(projectId),
      ])
      return { project, baselines, integrations }
    } catch {
      // fallback
    }
  }

  const id = projectId || currentProjectId
  return {
    project: mockProjectView(id),
    baselines: getBaselinesByProjectId(id),
    integrations: mockIntegrations,
  }
}

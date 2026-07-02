/** @deprecated Import from '@/mocks' instead */
import { projects, currentProjectId } from './projects'
import { requirements } from './requirements'
import { users, currentUser } from './users'
import { calculateOverallProgress } from '@/utils/requirement'

export const currentProject = {
  ...projects[0],
  progress: calculateOverallProgress(
    requirements.filter((r) => r.projectId === currentProjectId),
  ),
  totalRequirements: requirements.filter((r) => r.projectId === currentProjectId).length,
  memberCount: users.length,
}

export { currentUser, currentProjectId, projects, requirements, users }

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '@/types'
import {
  checkHealth,
  fetchCurrentUser,
  fetchProjects,
  fetchSession,
  fetchUsers,
  setActiveProject as setActiveProjectApi,
  setCurrentUser as setCurrentUserApi,
} from '@/api/client'
import type { ProjectView } from '@/api/types'
import { projects as mockProjects, currentProjectId as mockProjectId } from '@/mocks/data/projects'
import { users as mockUsers, currentUser as mockCurrentUser } from '@/mocks/data/users'
import { requirements as mockRequirements } from '@/mocks/data/requirements'
import { calculateOverallProgress } from '@/utils/requirement'

function enrichMockProjects(): ProjectView[] {
  return mockProjects.map((p) => {
    const reqs = mockRequirements.filter((r) => r.projectId === p.id)
    return {
      ...p,
      totalRequirements: reqs.length,
      memberCount: mockUsers.length,
      progress: calculateOverallProgress(reqs),
    }
  })
}

interface AppContextValue {
  projects: ProjectView[]
  activeProjectId: string
  currentProject: ProjectView
  currentUser: User
  users: User[]
  apiConnected: boolean
  loading: boolean
  setActiveProject: (projectId: string) => Promise<void>
  setCurrentUser: (userId: string) => Promise<void>
  refresh: () => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<ProjectView[]>(enrichMockProjects)
  const [activeProjectId, setActiveProjectId] = useState(mockProjectId)
  const [currentUser, setCurrentUserState] = useState<User>(mockCurrentUser)
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [apiConnected, setApiConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const ok = await checkHealth()
    setApiConnected(ok)
    if (!ok) {
      setProjects(enrichMockProjects())
      setLoading(false)
      return
    }

    try {
      const [projs, session, user, allUsers] = await Promise.all([
        fetchProjects(),
        fetchSession(),
        fetchCurrentUser(),
        fetchUsers(),
      ])
      setProjects(projs)
      setActiveProjectId(session.activeProjectId)
      setCurrentUserState(user)
      setUsers(allUsers)
    } catch {
      setApiConnected(false)
      setProjects(enrichMockProjects())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const setActiveProject = useCallback(
    async (projectId: string) => {
      setActiveProjectId(projectId)
      if (apiConnected) {
        try {
          await setActiveProjectApi(projectId)
          const projs = await fetchProjects()
          setProjects(projs)
        } catch {
          // keep local selection
        }
      }
    },
    [apiConnected],
  )

  const setCurrentUser = useCallback(
    async (userId: string) => {
      const local = users.find((u) => u.id === userId)
      if (local) setCurrentUserState(local)

      if (apiConnected) {
        try {
          const user = await setCurrentUserApi(userId)
          setCurrentUserState(user)
        } catch {
          // keep local selection
        }
      }
    },
    [apiConnected, users],
  )

  const currentProject = useMemo(() => {
    return (
      projects.find((p) => p.id === activeProjectId) ??
      projects[0] ?? {
        id: mockProjectId,
        name: '프로젝트',
        description: '',
        createdAt: new Date().toISOString(),
        progress: 0,
        totalRequirements: 0,
        memberCount: users.length,
      }
    )
  }, [projects, activeProjectId, users.length])

  const value = useMemo(
    () => ({
      projects,
      activeProjectId,
      currentProject,
      currentUser,
      users,
      apiConnected,
      loading,
      setActiveProject,
      setCurrentUser,
      refresh,
    }),
    [
      projects,
      activeProjectId,
      currentProject,
      currentUser,
      users,
      apiConnected,
      loading,
      setActiveProject,
      setCurrentUser,
      refresh,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

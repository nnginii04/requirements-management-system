import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  Requirement,
  RequirementVersion,
  RequirementWorkflowStatus,
} from '@/types'
import { requirements as initialRequirements } from '@/mocks/data/requirements'
import { requirementVersions as initialVersions } from '@/mocks/data/requirementVersions'
import { currentProjectId } from '@/mocks/data/projects'
import { currentUser, users } from '@/mocks/data/users'
import * as api from '@/api/client'

interface RequirementsContextValue {
  requirements: Requirement[]
  versions: RequirementVersion[]
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  loading: boolean
  apiConnected: boolean
  refresh: () => Promise<void>
  updateRequirement: (id: string, patch: Partial<Requirement>) => void
  updateStatus: (id: string, status: RequirementWorkflowStatus) => void
  assignBaseline: (id: string, baselineId: string | null) => void
  deleteRequirement: (id: string) => void
  duplicateRequirement: (id: string) => Requirement | null
  addRequirement: (req: Requirement) => void
  addVersion: (version: RequirementVersion) => void
  getVersionsFor: (requirementId: string) => RequirementVersion[]
}

const RequirementsContext = createContext<RequirementsContextValue | null>(null)

export function RequirementsProvider({ children }: { children: ReactNode }) {
  const [requirements, setRequirements] = useState<Requirement[]>(initialRequirements)
  const [versions, setVersions] = useState<RequirementVersion[]>(initialVersions)
  const [selectedId, setSelectedId] = useState<string | null>(
    initialRequirements[0]?.id ?? null,
  )
  const [loading, setLoading] = useState(true)
  const [apiConnected, setApiConnected] = useState(false)

  const refresh = useCallback(async () => {
    const ok = await api.checkHealth()
    setApiConnected(ok)
    if (!ok) {
      setLoading(false)
      return
    }
    try {
      const reqs = await api.fetchRequirements()
      setRequirements(reqs)
    } catch {
      setApiConnected(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const updateRequirement = useCallback(
    (id: string, patch: Partial<Requirement>) => {
      setRequirements((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, ...patch, updatedAt: new Date().toISOString() } : r,
        ),
      )
      if (apiConnected) {
        api.patchRequirement(id, patch).then(refresh).catch(() => {})
      }
    },
    [apiConnected, refresh],
  )

  const updateStatus = useCallback(
    (id: string, status: RequirementWorkflowStatus) => {
      updateRequirement(id, { status })
    },
    [updateRequirement],
  )

  const assignBaseline = useCallback(
    (id: string, baselineId: string | null) => {
      updateRequirement(id, { baseline: baselineId })
    },
    [updateRequirement],
  )

  const deleteRequirement = useCallback((id: string) => {
    setRequirements((prev) => prev.filter((r) => r.id !== id))
    setSelectedId((prev) => (prev === id ? null : prev))
  }, [])

  const duplicateRequirement = useCallback(
    (id: string) => {
      const source = requirements.find((r) => r.id === id)
      if (!source) return null

      const newId = `REQ-${String(requirements.length + 1).padStart(3, '0')}`
      const copy: Requirement = {
        ...source,
        id: newId,
        title: `${source.title} (복사)`,
        status: 'draft',
        version: '1.0',
        baseline: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        implementationScore: 0,
        traceabilityLinks: [],
      }
      setRequirements((prev) => [...prev, copy])
      setSelectedId(newId)
      if (apiConnected) {
        api.createRequirement(copy).then(refresh).catch(() => {})
      }
      return copy
    },
    [requirements, apiConnected, refresh],
  )

  const addRequirement = useCallback(
    (req: Requirement) => {
      setRequirements((prev) => [...prev, req])
      setSelectedId(req.id)
      if (apiConnected) {
        api.createRequirement(req).then(refresh).catch(() => {})
      }
    },
    [apiConnected, refresh],
  )

  const addVersion = useCallback((version: RequirementVersion) => {
    setVersions((prev) => [...prev, version])
  }, [])

  const getVersionsFor = useCallback(
    (requirementId: string) =>
      versions
        .filter((v) => v.requirementId === requirementId)
        .sort((a, b) => b.changedAt.localeCompare(a.changedAt)),
    [versions],
  )

  const value = useMemo(
    () => ({
      requirements,
      versions,
      selectedId,
      setSelectedId,
      loading,
      apiConnected,
      refresh,
      updateRequirement,
      updateStatus,
      assignBaseline,
      deleteRequirement,
      duplicateRequirement,
      addRequirement,
      addVersion,
      getVersionsFor,
    }),
    [
      requirements,
      versions,
      selectedId,
      loading,
      apiConnected,
      refresh,
      updateRequirement,
      updateStatus,
      assignBaseline,
      deleteRequirement,
      duplicateRequirement,
      addRequirement,
      addVersion,
      getVersionsFor,
    ],
  )

  return (
    <RequirementsContext.Provider value={value}>
      {children}
    </RequirementsContext.Provider>
  )
}

export function useRequirements() {
  const ctx = useContext(RequirementsContext)
  if (!ctx) throw new Error('useRequirements must be used within RequirementsProvider')
  return ctx
}

export { currentProjectId, currentUser, users }

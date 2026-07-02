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
import * as api from '@/api/client'
import { nextRequirementId } from '@/utils/requirementIds'

export type RequirementInput = Partial<Requirement> & {
  title: string
  projectId: string
}

function buildLocalRequirement(input: RequirementInput, id: string): Requirement {
  const now = new Date().toISOString()
  return {
    id,
    projectId: input.projectId,
    title: input.title,
    description: input.description ?? '',
    type: input.type ?? 'functional',
    priority: input.priority ?? 'medium',
    status: input.status ?? 'draft',
    owner: input.owner ?? 'user-001',
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
    dueDate:
      input.dueDate ?? new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    version: input.version ?? '1.0',
    baseline: input.baseline ?? null,
    acceptanceCriteria: input.acceptanceCriteria ?? [],
    implementationScore: input.implementationScore ?? 0,
    traceabilityLinks: input.traceabilityLinks ?? [],
    source: input.source,
    tags: input.tags,
    relatedFeature: input.relatedFeature,
  }
}

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
  deleteRequirement: (id: string) => Promise<void>
  duplicateRequirement: (id: string) => Promise<Requirement | null>
  addRequirement: (input: RequirementInput) => Promise<Requirement>
  addRequirementsSequential: (inputs: RequirementInput[]) => Promise<Requirement[]>
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
      const [reqs, vers] = await Promise.all([
        api.fetchRequirements(),
        api.fetchAllVersions(),
      ])
      setRequirements(reqs)
      setVersions(vers)
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

  const deleteRequirement = useCallback(
    async (id: string) => {
      if (apiConnected) {
        try {
          await api.deleteRequirement(id)
          await refresh()
          setSelectedId((prev) => (prev === id ? null : prev))
          return
        } catch {
          // fallback to local delete
        }
      }
      setRequirements((prev) => prev.filter((r) => r.id !== id))
      setSelectedId((prev) => (prev === id ? null : prev))
    },
    [apiConnected, refresh],
  )

  const addRequirement = useCallback(
    async (input: RequirementInput): Promise<Requirement> => {
      if (apiConnected) {
        try {
          const created = await api.createRequirement(input)
          await refresh()
          setSelectedId(created.id)
          return created
        } catch {
          // fallback to local create
        }
      }

      let created!: Requirement
      setRequirements((prev) => {
        const id = input.id ?? nextRequirementId(prev)
        created = buildLocalRequirement(input, id)
        return [...prev, created]
      })
      setSelectedId(created.id)
      return created
    },
    [apiConnected, refresh],
  )

  const addRequirementsSequential = useCallback(
    async (inputs: RequirementInput[]): Promise<Requirement[]> => {
      const created: Requirement[] = []
      for (const input of inputs) {
        const req = await addRequirement(input)
        created.push(req)
      }
      return created
    },
    [addRequirement],
  )

  const duplicateRequirement = useCallback(
    async (id: string): Promise<Requirement | null> => {
      const source = requirements.find((r) => r.id === id)
      if (!source) return null

      return addRequirement({
        projectId: source.projectId,
        title: `${source.title} (복사)`,
        description: source.description,
        type: source.type,
        priority: source.priority,
        status: 'draft',
        owner: source.owner,
        dueDate: source.dueDate,
        acceptanceCriteria: [...source.acceptanceCriteria],
        source: source.source,
        tags: source.tags ? [...source.tags] : undefined,
        relatedFeature: source.relatedFeature,
      })
    },
    [requirements, addRequirement],
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
      addRequirementsSequential,
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
      addRequirementsSequential,
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

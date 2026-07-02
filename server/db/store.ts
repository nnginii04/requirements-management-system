import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type {
  AnalysisFinding,
  Baseline,
  BuildHistory,
  Document,
  Project,
  Requirement,
  RequirementBuildSnapshot,
  RequirementVersion,
  User,
} from '../../src/types/domain.js'
import type { RequirementValidationDetail } from '../../src/utils/validation.js'
import type { GeneratedDocumentRecord } from '../services/documents.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_PATH = join(__dirname, 'reqflow.json')

export interface WebhookEvent {
  id: string
  source: 'github' | 'jenkins'
  payload: unknown
  createdAt: string
  summary: string
}

export interface ImpactAnalysis {
  requirementId: string
  documents: string[]
  codeFiles: string[]
  tests: string[]
  builds: number[]
  affectedRequirements: string[]
}

export interface IntegrationStatus {
  jenkins: { connected: boolean; label: string }
  git: { connected: boolean; label: string }
  aiEngine: { connected: boolean; label: string }
}

export interface DbState {
  requirements: Requirement[]
  versions: RequirementVersion[]
  builds: BuildHistory[]
  snapshots: RequirementBuildSnapshot[]
  validationDetails: RequirementValidationDetail[]
  webhookEvents: WebhookEvent[]
  analysisFindings: AnalysisFinding[]
  documents: Document[]
  baselines: Baseline[]
  projects: Project[]
  users: User[]
  generatedDocuments: GeneratedDocumentRecord[]
  activeProjectId: string
  currentUserId: string
}

let cache: DbState | null = null

export function loadDb(): DbState {
  if (cache) return cache
  if (!existsSync(DB_PATH)) {
    cache = emptyDb()
    persist(cache)
    return cache
  }
  const raw = readFileSync(DB_PATH, 'utf-8')
  const parsed = JSON.parse(raw) as Partial<DbState>
  cache = normalizeDb(parsed)
  return cache
}

function normalizeDb(partial: Partial<DbState>): DbState {
  const empty = emptyDb()
  return {
    ...empty,
    ...partial,
    analysisFindings: partial.analysisFindings ?? empty.analysisFindings,
    documents: partial.documents ?? empty.documents,
    baselines: partial.baselines ?? empty.baselines,
    projects: partial.projects ?? empty.projects,
    users: partial.users ?? empty.users,
    generatedDocuments: partial.generatedDocuments ?? empty.generatedDocuments,
    activeProjectId: partial.activeProjectId ?? empty.activeProjectId,
    currentUserId: partial.currentUserId ?? empty.currentUserId,
    webhookEvents: partial.webhookEvents ?? empty.webhookEvents,
  }
}

export function persist(state: DbState): void {
  mkdirSync(dirname(DB_PATH), { recursive: true })
  writeFileSync(DB_PATH, JSON.stringify(state, null, 2), 'utf-8')
  cache = state
}

export function mutate(fn: (state: DbState) => void): DbState {
  const state = structuredClone(loadDb())
  fn(state)
  persist(state)
  return state
}

export function emptyDb(): DbState {
  return {
    requirements: [],
    versions: [],
    builds: [],
    snapshots: [],
    validationDetails: [],
    webhookEvents: [],
    analysisFindings: [],
    documents: [],
    baselines: [],
    projects: [],
    users: [],
    generatedDocuments: [],
    activeProjectId: 'proj-001',
    currentUserId: 'user-001',
  }
}

export function getProjectId(): string {
  return loadDb().activeProjectId || loadDb().requirements[0]?.projectId || 'proj-001'
}

export function getProjectRequirementIds(projectId: string): Set<string> {
  return new Set(loadDb().requirements.filter((r) => r.projectId === projectId).map((r) => r.id))
}

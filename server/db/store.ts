import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Requirement, RequirementVersion, BuildHistory, RequirementBuildSnapshot } from '../../src/types/domain.js'
import type { RequirementValidationDetail } from '../../src/utils/validation.js'

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

export interface DbState {
  requirements: Requirement[]
  versions: RequirementVersion[]
  builds: BuildHistory[]
  snapshots: RequirementBuildSnapshot[]
  validationDetails: RequirementValidationDetail[]
  webhookEvents: WebhookEvent[]
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
  cache = JSON.parse(raw) as DbState
  return cache
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
  }
}

export function getProjectId(): string {
  return loadDb().requirements[0]?.projectId ?? 'proj-001'
}

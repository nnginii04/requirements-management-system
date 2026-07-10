import type {
  AnalysisFinding,
  Baseline,
  BuildHistory,
  Document,
  Project,
  Requirement,
  RequirementBuildSnapshot,
  RequirementVersion,
  TraceabilityLink,
  User,
} from '../../src/types/domain.js'
import type { RequirementValidationDetail } from '../../src/utils/validation.js'
import type { GeneratedDocumentRecord } from '../services/documents.js'
import { prisma } from './prisma.ts'

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

export interface TraceabilityRecord {
  projectId: string
  requirementId: string
  requirementTitle: string
  source: string
  linkedDocuments: string[]
  linkedCodeFiles: string[]
  linkedBuilds: string[]
  linkedTests: string[]
  similarityScore: number
  linkStatus: 'linked' | 'partial' | 'missing'
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
  traceabilityRecords: TraceabilityRecord[]
  activeProjectId: string
  currentUserId: string
}

let cache: DbState | null = null

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
    traceabilityRecords: [],
    activeProjectId: 'proj-001',
    currentUserId: 'user-001',
  }
}

/**
 * Load every table from MySQL into the in-memory cache. Must be called once
 * during server boot (before any route handler runs). Keeping the loaded state
 * in memory lets loadDb()/mutate() stay synchronous so existing routes are
 * unchanged; writes are flushed back to MySQL asynchronously.
 */
export async function hydrate(): Promise<DbState> {
  const [
    projects,
    users,
    requirements,
    versions,
    builds,
    snapshots,
    validationDetails,
    analysisFindings,
    documents,
    baselines,
    generatedDocuments,
    traceabilityRecords,
    webhookEvents,
    appState,
  ] = await Promise.all([
    prisma.project.findMany(),
    prisma.user.findMany(),
    prisma.requirement.findMany(),
    prisma.requirementVersion.findMany(),
    prisma.buildHistory.findMany(),
    prisma.requirementBuildSnapshot.findMany(),
    prisma.validationDetail.findMany(),
    prisma.analysisFinding.findMany(),
    prisma.document.findMany(),
    prisma.baseline.findMany(),
    prisma.generatedDocument.findMany(),
    prisma.traceabilityRecord.findMany(),
    prisma.webhookEvent.findMany(),
    prisma.appState.findFirst(),
  ])

  cache = {
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      createdAt: p.createdAt,
      progress: p.progress,
    })),
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatarInitials: u.avatarInitials,
    })),
    requirements: requirements.map((r) => ({
      id: r.id,
      projectId: r.projectId,
      title: r.title,
      description: r.description,
      type: r.type as Requirement['type'],
      priority: r.priority as Requirement['priority'],
      status: r.status as Requirement['status'],
      owner: r.owner,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      dueDate: r.dueDate,
      version: r.version,
      baseline: r.baseline ?? null,
      acceptanceCriteria: (r.acceptanceCriteria as string[]) ?? [],
      implementationScore: r.implementationScore,
      traceabilityLinks: (r.traceabilityLinks as unknown as TraceabilityLink[]) ?? [],
      source: r.source ?? undefined,
      tags: (r.tags as string[] | null) ?? undefined,
      relatedFeature: r.relatedFeature ?? undefined,
    })),
    versions: versions.map((v) => ({
      id: v.id,
      requirementId: v.requirementId,
      version: v.version,
      changedBy: v.changedBy,
      changedAt: v.changedAt,
      changeSummary: v.changeSummary,
      previousContent: v.previousContent,
      currentContent: v.currentContent,
    })),
    builds: builds.map((b) => ({
      id: b.id,
      projectId: b.projectId,
      buildNumber: b.buildNumber,
      status: b.status as BuildHistory['status'],
      branch: b.branch,
      commitId: b.commitId,
      commitMessage: b.commitMessage,
      testResult: b.testResult as BuildHistory['testResult'],
      testPassed: b.testPassed,
      testTotal: b.testTotal,
      requirementProgress: b.requirementProgress,
      progressChange: b.progressChange,
      changedRequirements: (b.changedRequirements as string[]) ?? [],
      failedRequirements: (b.failedRequirements as string[]) ?? [],
      relatedFiles: (b.relatedFiles as string[]) ?? [],
      duration: b.duration,
      createdAt: b.createdAt,
    })),
    snapshots: snapshots.map((s) => ({
      buildNumber: s.buildNumber,
      requirementId: s.requirementId,
      progress: s.progress,
      createdAt: s.createdAt,
    })),
    validationDetails: validationDetails.map((d) => ({
      requirementId: d.requirementId,
      matches: d.matches as unknown as RequirementValidationDetail['matches'],
      missingLogic: (d.missingLogic as string[]) ?? [],
      aiExplanation: d.aiExplanation,
      acceptanceCriteriaStatus:
        d.acceptanceCriteriaStatus as unknown as RequirementValidationDetail['acceptanceCriteriaStatus'],
      buildVerification: d.buildVerification as unknown as RequirementValidationDetail['buildVerification'],
    })),
    analysisFindings: analysisFindings.map((f) => ({
      id: f.id,
      type: f.type as AnalysisFinding['type'],
      requirementIds: (f.requirementIds as string[]) ?? [],
      description: f.description,
      severity: f.severity as AnalysisFinding['severity'],
      confidence: f.confidence,
      suggestedAction: f.suggestedAction,
      aiExplanation: f.aiExplanation ?? undefined,
      similarityScore: f.similarityScore ?? undefined,
    })),
    documents: documents.map((doc) => ({
      id: doc.id,
      projectId: doc.projectId,
      type: doc.type as Document['type'],
      title: doc.title,
      content: doc.content,
      generatedAt: doc.generatedAt,
      sourceRequirements: (doc.sourceRequirements as string[]) ?? [],
    })),
    baselines: baselines.map((b) => ({
      id: b.id,
      name: b.name,
      version: b.version,
      createdAt: b.createdAt,
      requirements: (b.requirements as string[]) ?? [],
    })),
    generatedDocuments: generatedDocuments.map((g) => g.payload as unknown as GeneratedDocumentRecord),
    traceabilityRecords: traceabilityRecords.map((t) => ({
      projectId: t.projectId,
      requirementId: t.requirementId,
      requirementTitle: t.requirementTitle,
      source: t.source,
      linkedDocuments: (t.linkedDocuments as string[]) ?? [],
      linkedCodeFiles: (t.linkedCodeFiles as string[]) ?? [],
      linkedBuilds: (t.linkedBuilds as string[]) ?? [],
      linkedTests: (t.linkedTests as string[]) ?? [],
      similarityScore: t.similarityScore,
      linkStatus: t.linkStatus as TraceabilityRecord['linkStatus'],
    })),
    webhookEvents: webhookEvents.map((w) => ({
      id: w.id,
      source: w.source as WebhookEvent['source'],
      payload: w.payload,
      createdAt: w.createdAt,
      summary: w.summary,
    })),
    activeProjectId: appState?.activeProjectId ?? 'proj-001',
    currentUserId: appState?.currentUserId ?? 'user-001',
  }

  // If the DB was already initialized, use it as the diff baseline. On a fresh
  // DB (no app_state row) leave the baseline unset so the first flush does a
  // full insert.
  if (appState) snapshotPersisted(cache)

  return cache
}

export function isHydrated(): boolean {
  return cache !== null
}

export function loadDb(): DbState {
  if (!cache) {
    throw new Error('[db] loadDb() called before hydrate(). Call hydrate() during server boot.')
  }
  return cache
}

// Row mappers: domain object → DB column shape. Shared by full-rewrite and diff.
const requirementRow = (r: Requirement) => ({
  id: r.id,
  projectId: r.projectId,
  title: r.title,
  description: r.description,
  type: r.type,
  priority: r.priority,
  status: r.status,
  owner: r.owner,
  createdAt: r.createdAt,
  updatedAt: r.updatedAt,
  dueDate: r.dueDate,
  version: r.version,
  baseline: r.baseline ?? null,
  acceptanceCriteria: r.acceptanceCriteria,
  implementationScore: r.implementationScore,
  traceabilityLinks: r.traceabilityLinks,
  source: r.source ?? null,
  tags: r.tags ?? null,
  relatedFeature: r.relatedFeature ?? null,
})
const analysisFindingRow = (f: AnalysisFinding) => ({
  id: f.id,
  type: f.type,
  requirementIds: f.requirementIds,
  description: f.description,
  severity: f.severity,
  confidence: f.confidence,
  suggestedAction: f.suggestedAction,
  aiExplanation: f.aiExplanation ?? null,
  similarityScore: f.similarityScore ?? null,
})
const snapshotRow = (s: RequirementBuildSnapshot) => ({
  buildNumber: s.buildNumber,
  requirementId: s.requirementId,
  progress: s.progress,
  createdAt: s.createdAt,
})
const generatedDocRow = (g: GeneratedDocumentRecord) => ({ id: g.id, projectId: g.projectId, payload: g })
const webhookRow = (w: WebhookEvent) => ({
  id: w.id,
  source: w.source,
  payload: w.payload,
  createdAt: w.createdAt,
  summary: w.summary,
})

/** Snapshot the persisted state so the next flush can diff against it. */
let lastPersisted: DbState | null = null

function snapshotPersisted(state: DbState): void {
  lastPersisted = structuredClone(state)
}

function diffByKey<T>(prev: T[], next: T[], key: (item: T) => string) {
  const prevMap = new Map(prev.map((x) => [key(x), x]))
  const nextMap = new Map(next.map((x) => [key(x), x]))
  const upserts: T[] = []
  const removedKeys: string[] = []
  for (const [k, v] of nextMap) {
    const p = prevMap.get(k)
    if (!p || JSON.stringify(p) !== JSON.stringify(v)) upserts.push(v)
  }
  for (const k of prevMap.keys()) if (!nextMap.has(k)) removedKeys.push(k)
  return { upserts, removedKeys }
}

/**
 * Full wipe-and-reinsert. Used only to establish the first baseline (before any
 * diff snapshot exists); steady-state writes go through the diff path below.
 */
async function fullRewrite(state: DbState): Promise<void> {
  await prisma.$transaction([
    prisma.appState.deleteMany(),
    prisma.webhookEvent.deleteMany(),
    prisma.traceabilityRecord.deleteMany(),
    prisma.generatedDocument.deleteMany(),
    prisma.validationDetail.deleteMany(),
    prisma.requirementBuildSnapshot.deleteMany(),
    prisma.analysisFinding.deleteMany(),
    prisma.baseline.deleteMany(),
    prisma.document.deleteMany(),
    prisma.buildHistory.deleteMany(),
    prisma.requirementVersion.deleteMany(),
    prisma.requirement.deleteMany(),
    prisma.user.deleteMany(),
    prisma.project.deleteMany(),

    prisma.project.createMany({ data: state.projects as any }),
    prisma.user.createMany({ data: state.users as any }),
    prisma.requirement.createMany({ data: state.requirements.map(requirementRow) as any }),
    prisma.requirementVersion.createMany({ data: state.versions as any }),
    prisma.buildHistory.createMany({ data: state.builds as any }),
    prisma.document.createMany({ data: state.documents as any }),
    prisma.baseline.createMany({ data: state.baselines as any }),
    prisma.analysisFinding.createMany({ data: state.analysisFindings.map(analysisFindingRow) as any }),
    prisma.requirementBuildSnapshot.createMany({ data: state.snapshots.map(snapshotRow) as any }),
    prisma.validationDetail.createMany({ data: state.validationDetails as any }),
    prisma.generatedDocument.createMany({ data: state.generatedDocuments.map(generatedDocRow) as any }),
    prisma.traceabilityRecord.createMany({ data: state.traceabilityRecords as any }),
    prisma.webhookEvent.createMany({ data: state.webhookEvents.map(webhookRow) as any }),
    prisma.appState.create({
      data: { id: 1, activeProjectId: state.activeProjectId, currentUserId: state.currentUserId },
    }),
  ])
}

/**
 * Incremental write-back: persist only the rows that actually changed since the
 * last flush. Deletes run children-first and upserts parents-first to satisfy
 * foreign keys. Falls back to a full rewrite when no baseline snapshot exists.
 */
async function flushToDb(state: DbState): Promise<void> {
  if (!lastPersisted) {
    await fullRewrite(state)
    snapshotPersisted(state)
    return
  }

  const prev = lastPersisted
  const byId = <T extends { id: string }>(p: T[], n: T[]) => diffByKey(p, n, (x) => x.id)
  const byReqId = <T extends { requirementId: string }>(p: T[], n: T[]) =>
    diffByKey(p, n, (x) => x.requirementId)
  const snapKey = (s: RequirementBuildSnapshot) => `${s.buildNumber}::${s.requirementId}`

  const projects = byId(prev.projects, state.projects)
  const users = byId(prev.users, state.users)
  const requirements = byId(prev.requirements, state.requirements)
  const versions = byId(prev.versions, state.versions)
  const builds = byId(prev.builds, state.builds)
  const documents = byId(prev.documents, state.documents)
  const baselines = byId(prev.baselines, state.baselines)
  const findings = byId(prev.analysisFindings, state.analysisFindings)
  const generated = byId(prev.generatedDocuments, state.generatedDocuments)
  const webhooks = byId(prev.webhookEvents, state.webhookEvents)
  const validations = byReqId(prev.validationDetails, state.validationDetails)
  const traces = byReqId(prev.traceabilityRecords, state.traceabilityRecords)
  const snapshots = diffByKey(prev.snapshots, state.snapshots, snapKey)

  const ops: any[] = []
  const del = (removed: string[], run: (ids: string[]) => any) => {
    if (removed.length) ops.push(run(removed))
  }

  // 1) Deletes, children before parents.
  del(webhooks.removedKeys, (ids) => prisma.webhookEvent.deleteMany({ where: { id: { in: ids } } }))
  del(traces.removedKeys, (ids) =>
    prisma.traceabilityRecord.deleteMany({ where: { requirementId: { in: ids } } }),
  )
  del(generated.removedKeys, (ids) => prisma.generatedDocument.deleteMany({ where: { id: { in: ids } } }))
  del(validations.removedKeys, (ids) =>
    prisma.validationDetail.deleteMany({ where: { requirementId: { in: ids } } }),
  )
  if (snapshots.removedKeys.length) {
    ops.push(
      prisma.requirementBuildSnapshot.deleteMany({
        where: {
          OR: snapshots.removedKeys.map((k) => {
            const [buildNumber, requirementId] = k.split('::')
            return { buildNumber: Number(buildNumber), requirementId }
          }),
        },
      }),
    )
  }
  del(findings.removedKeys, (ids) => prisma.analysisFinding.deleteMany({ where: { id: { in: ids } } }))
  del(baselines.removedKeys, (ids) => prisma.baseline.deleteMany({ where: { id: { in: ids } } }))
  del(documents.removedKeys, (ids) => prisma.document.deleteMany({ where: { id: { in: ids } } }))
  del(builds.removedKeys, (ids) => prisma.buildHistory.deleteMany({ where: { id: { in: ids } } }))
  del(versions.removedKeys, (ids) => prisma.requirementVersion.deleteMany({ where: { id: { in: ids } } }))
  del(requirements.removedKeys, (ids) => prisma.requirement.deleteMany({ where: { id: { in: ids } } }))
  del(users.removedKeys, (ids) => prisma.user.deleteMany({ where: { id: { in: ids } } }))
  del(projects.removedKeys, (ids) => prisma.project.deleteMany({ where: { id: { in: ids } } }))

  // 2) Upserts, parents before children.
  for (const p of projects.upserts) ops.push(prisma.project.upsert({ where: { id: p.id }, create: p as any, update: p as any }))
  for (const u of users.upserts) ops.push(prisma.user.upsert({ where: { id: u.id }, create: u as any, update: u as any }))
  for (const r of requirements.upserts) {
    const row = requirementRow(r)
    ops.push(prisma.requirement.upsert({ where: { id: r.id }, create: row as any, update: row as any }))
  }
  for (const v of versions.upserts) ops.push(prisma.requirementVersion.upsert({ where: { id: v.id }, create: v as any, update: v as any }))
  for (const b of builds.upserts) ops.push(prisma.buildHistory.upsert({ where: { id: b.id }, create: b as any, update: b as any }))
  for (const d of documents.upserts) ops.push(prisma.document.upsert({ where: { id: d.id }, create: d as any, update: d as any }))
  for (const b of baselines.upserts) ops.push(prisma.baseline.upsert({ where: { id: b.id }, create: b as any, update: b as any }))
  for (const f of findings.upserts) {
    const row = analysisFindingRow(f)
    ops.push(prisma.analysisFinding.upsert({ where: { id: f.id }, create: row as any, update: row as any }))
  }
  for (const d of validations.upserts) {
    ops.push(
      prisma.validationDetail.upsert({
        where: { requirementId: d.requirementId },
        create: d as any,
        update: d as any,
      }),
    )
  }
  for (const t of traces.upserts) {
    ops.push(
      prisma.traceabilityRecord.upsert({
        where: { requirementId: t.requirementId },
        create: t as any,
        update: t as any,
      }),
    )
  }
  for (const g of generated.upserts) {
    const row = generatedDocRow(g)
    ops.push(prisma.generatedDocument.upsert({ where: { id: g.id }, create: row as any, update: row as any }))
  }
  for (const w of webhooks.upserts) {
    const row = webhookRow(w)
    ops.push(prisma.webhookEvent.upsert({ where: { id: w.id }, create: row as any, update: row as any }))
  }
  // Snapshots are append-only; insert the newly-added ones.
  if (snapshots.upserts.length) {
    ops.push(prisma.requirementBuildSnapshot.createMany({ data: snapshots.upserts.map(snapshotRow) as any }))
  }
  // Session singleton.
  if (
    prev.activeProjectId !== state.activeProjectId ||
    prev.currentUserId !== state.currentUserId
  ) {
    ops.push(
      prisma.appState.upsert({
        where: { id: 1 },
        create: { id: 1, activeProjectId: state.activeProjectId, currentUserId: state.currentUserId },
        update: { activeProjectId: state.activeProjectId, currentUserId: state.currentUserId },
      }),
    )
  }

  if (ops.length > 0) {
    await prisma.$transaction(ops)
  }
  snapshotPersisted(state)
}

let writeChain: Promise<void> = Promise.resolve()

/** Schedule a serialized flush of the current cache to MySQL. */
function scheduleFlush(): Promise<void> {
  writeChain = writeChain
    .catch(() => {})
    .then(() => flushToDb(loadDb()))
    .catch((err) => {
      console.error('[db] flush failed:', err)
    })
  return writeChain
}

/** Await all pending MySQL writes (used by seeding to guarantee durability). */
export function flushDb(): Promise<void> {
  return writeChain
}

export function persist(state: DbState): void {
  cache = state
  void scheduleFlush()
}

export function mutate(fn: (state: DbState) => void): DbState {
  const state = structuredClone(loadDb())
  fn(state)
  cache = state
  void scheduleFlush()
  return state
}

export function getProjectId(): string {
  return loadDb().activeProjectId || loadDb().requirements[0]?.projectId || 'proj-001'
}

export function getProjectRequirementIds(projectId: string): Set<string> {
  return new Set(loadDb().requirements.filter((r) => r.projectId === projectId).map((r) => r.id))
}

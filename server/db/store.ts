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
      traceabilityLinks: (r.traceabilityLinks as TraceabilityLink[]) ?? [],
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
      matches: d.matches as RequirementValidationDetail['matches'],
      missingLogic: (d.missingLogic as string[]) ?? [],
      aiExplanation: d.aiExplanation,
      acceptanceCriteriaStatus:
        d.acceptanceCriteriaStatus as RequirementValidationDetail['acceptanceCriteriaStatus'],
      buildVerification: d.buildVerification as RequirementValidationDetail['buildVerification'],
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
    generatedDocuments: generatedDocuments.map((g) => g.payload as GeneratedDocumentRecord),
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

/**
 * Full-state write-back to MySQL. Wipes and re-inserts every table inside a
 * transaction. Simple and always-consistent; fine at PoC scale (hundreds of
 * rows). Writes are serialized through writeChain so concurrent mutations never
 * race, and each flush writes the latest cache snapshot.
 */
async function flushToDb(state: DbState): Promise<void> {
  await prisma.$transaction([
    // delete children before parents to satisfy FK constraints
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

    // re-insert parents before children
    prisma.project.createMany({ data: state.projects as any }),
    prisma.user.createMany({ data: state.users as any }),
    prisma.requirement.createMany({
      data: state.requirements.map((r) => ({
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
      })) as any,
    }),
    prisma.requirementVersion.createMany({ data: state.versions as any }),
    prisma.buildHistory.createMany({ data: state.builds as any }),
    prisma.document.createMany({ data: state.documents as any }),
    prisma.baseline.createMany({ data: state.baselines as any }),
    prisma.analysisFinding.createMany({
      data: state.analysisFindings.map((f) => ({
        id: f.id,
        type: f.type,
        requirementIds: f.requirementIds,
        description: f.description,
        severity: f.severity,
        confidence: f.confidence,
        suggestedAction: f.suggestedAction,
        aiExplanation: f.aiExplanation ?? null,
        similarityScore: f.similarityScore ?? null,
      })) as any,
    }),
    prisma.requirementBuildSnapshot.createMany({
      data: state.snapshots.map((s) => ({
        buildNumber: s.buildNumber,
        requirementId: s.requirementId,
        progress: s.progress,
        createdAt: s.createdAt,
      })) as any,
    }),
    prisma.validationDetail.createMany({ data: state.validationDetails as any }),
    prisma.generatedDocument.createMany({
      data: state.generatedDocuments.map((g) => ({
        id: g.id,
        projectId: g.projectId,
        payload: g,
      })) as any,
    }),
    prisma.traceabilityRecord.createMany({ data: state.traceabilityRecords as any }),
    prisma.webhookEvent.createMany({
      data: state.webhookEvents.map((w) => ({
        id: w.id,
        source: w.source,
        payload: w.payload,
        createdAt: w.createdAt,
        summary: w.summary,
      })) as any,
    }),
    prisma.appState.create({
      data: { id: 1, activeProjectId: state.activeProjectId, currentUserId: state.currentUserId },
    }),
  ])
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

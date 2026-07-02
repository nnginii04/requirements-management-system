import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { emptyDb, loadDb, persist, type DbState } from './store.js'
import { enrichMatchesWithSnippets } from '../lib/snippets.js'
import { scoreFromValidationDetail } from '../lib/scoreEngine.js'
import { calculateOverallProgress } from '../../src/utils/requirement.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_PATH = join(__dirname, 'reqflow.json')

async function loadMockModules() {
  const [
    { requirements },
    { requirementVersions },
    { buildHistories, requirementBuildSnapshots },
    { validationDetails },
    { analysisFindings },
    { documents },
    { baselines },
    { projects },
    { users },
  ] = await Promise.all([
    import('../../src/mocks/data/requirements.ts'),
    import('../../src/mocks/data/requirementVersions.ts'),
    import('../../src/mocks/data/buildHistories.ts'),
    import('../../src/mocks/data/validationDetails.ts'),
    import('../../src/mocks/data/analysisFindings.ts'),
    import('../../src/mocks/data/documents.ts'),
    import('../../src/mocks/data/baselines.ts'),
    import('../../src/mocks/data/projects.ts'),
    import('../../src/mocks/data/users.ts'),
  ])

  const enrichedValidation = validationDetails.map((d) => ({
    ...d,
    matches: enrichMatchesWithSnippets(d.matches),
  }))

  const scoredRequirements = requirements.map((r) => {
    const detail = enrichedValidation.find((d) => d.requirementId === r.id)
    if (!detail) return r
    return { ...r, implementationScore: scoreFromValidationDetail(detail) }
  })

  const projectsWithProgress = projects.map((p) => {
    const projectReqs = scoredRequirements.filter((r) => r.projectId === p.id)
    return {
      ...p,
      progress: calculateOverallProgress(projectReqs),
    }
  })

  return {
    requirements: scoredRequirements,
    versions: requirementVersions,
    builds: buildHistories,
    snapshots: requirementBuildSnapshots,
    validationDetails: enrichedValidation,
    analysisFindings,
    documents,
    baselines,
    projects: projectsWithProgress,
    users,
  }
}


function buildTraceabilityRecords(data: Awaited<ReturnType<typeof loadMockModules>>) {
  return data.requirements.map((requirement) => {
    const detail = data.validationDetails.find((d) => d.requirementId === requirement.id)
    const linkedDocuments = data.documents
      .filter((doc) => doc.projectId === requirement.projectId && doc.sourceRequirements.includes(requirement.id))
      .map((doc) => doc.title)

    const linkedCodeFiles = detail
      ? [...new Set(detail.matches.filter((m) => m.score >= 0.4).map((m) => m.displayName))]
      : []
    const linkedBuilds = detail
      ? [...new Set(detail.matches.map((m) => `Build #${m.buildNumber}`))]
      : []
    const linkedTests = detail
      ? [...new Set(detail.matches.map((m) => m.testCase).filter(Boolean) as string[])]
      : []

    for (const link of requirement.traceabilityLinks) {
      if (link.targetType === 'test' && !linkedTests.includes(link.targetId)) {
        linkedTests.push(link.targetId)
      }
      if (link.targetType === 'code' && !linkedCodeFiles.includes(link.targetId)) {
        linkedCodeFiles.push(link.targetId)
      }
    }

    const scores = detail?.matches.map((m) => m.score) ?? []
    const similarityScore =
      scores.length > 0 ? Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100) / 100 : 0
    const linkStatus = similarityScore >= 0.85 ? 'linked' : similarityScore >= 0.4 ? 'partial' : 'missing'

    return {
      projectId: requirement.projectId,
      requirementId: requirement.id,
      requirementTitle: requirement.title,
      source: requirement.source ?? 'Manual Input',
      linkedDocuments,
      linkedCodeFiles,
      linkedBuilds,
      linkedTests,
      similarityScore,
      linkStatus,
    }
  })
}

function applyMockData(state: DbState, data: Awaited<ReturnType<typeof loadMockModules>>): void {
  state.requirements = data.requirements
  state.versions = data.versions
  state.builds = data.builds
  state.snapshots = data.snapshots
  state.validationDetails = data.validationDetails
  state.analysisFindings = data.analysisFindings
  state.documents = data.documents
  state.baselines = data.baselines
  state.projects = data.projects
  state.users = data.users
  state.generatedDocuments = []
  state.traceabilityRecords = buildTraceabilityRecords(data)
  state.activeProjectId = data.projects[0]?.id ?? 'proj-001'
  state.currentUserId = data.users[0]?.id ?? 'user-001'
}

export async function seedIfEmpty(): Promise<void> {
  const data = await loadMockModules()

  if (!existsSync(DB_PATH)) {
    const state = emptyDb()
    applyMockData(state, data)
    persist(state)
    console.log(`[seed] Created DB with ${state.requirements.length} requirements`)
    return
  }

  const state = loadDb()
  if (state.requirements.length === 0) {
    applyMockData(state, data)
    persist(state)
    console.log(`[seed] Loaded ${state.requirements.length} requirements`)
    return
  }

  let changed = false
  if (!state.analysisFindings?.length) {
    state.analysisFindings = data.analysisFindings
    changed = true
  }
  if (!state.documents?.length) {
    state.documents = data.documents
    changed = true
  }
  if (!state.baselines?.length) {
    state.baselines = data.baselines
    changed = true
  }
  if (!state.projects?.length) {
    state.projects = data.projects
    changed = true
  } else if (state.projects.length < data.projects.length) {
    state.projects = data.projects
    changed = true
  }
  if (!state.users?.length) {
    state.users = data.users
    changed = true
  }
  if (!state.activeProjectId) {
    state.activeProjectId = data.projects[0]?.id ?? 'proj-001'
    changed = true
  }
  if (!state.currentUserId) {
    state.currentUserId = data.users[0]?.id ?? 'user-001'
    changed = true
  }
  if (!state.generatedDocuments) {
    state.generatedDocuments = []
    changed = true
  }
  if (!state.traceabilityRecords?.length) {
    state.traceabilityRecords = buildTraceabilityRecords(data)
    changed = true
  }

  if (changed) {
    persist(state)
    console.log('[seed] Backfilled missing collections')
  }
}

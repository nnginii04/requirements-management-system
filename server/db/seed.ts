import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { emptyDb, loadDb, persist } from './store.js'
import { enrichMatchesWithSnippets } from '../lib/snippets.js'
import { scoreFromValidationDetail } from '../lib/scoreEngine.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_PATH = join(__dirname, 'reqflow.json')

export async function seedIfEmpty(): Promise<void> {
  if (existsSync(DB_PATH) && loadDb().requirements.length > 0) return

  const [
    { requirements },
    { requirementVersions },
    { buildHistories, requirementBuildSnapshots },
    { validationDetails },
  ] = await Promise.all([
    import('../../src/mocks/data/requirements.ts'),
    import('../../src/mocks/data/requirementVersions.ts'),
    import('../../src/mocks/data/buildHistories.ts'),
    import('../../src/mocks/data/validationDetails.ts'),
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

  const state = emptyDb()
  state.requirements = scoredRequirements
  state.versions = requirementVersions
  state.builds = buildHistories
  state.snapshots = requirementBuildSnapshots
  state.validationDetails = enrichedValidation
  persist(state)
  console.log(`[seed] Loaded ${state.requirements.length} requirements, ${state.builds.length} builds`)
}

import { mutate, loadDb, getProjectId } from '../db/store.js'
import {
  parseRequirementIds,
  mapFilesToRequirements,
  bumpScore,
  scoreFromValidationDetail,
} from '../lib/scoreEngine.js'
import type { BuildHistory, RequirementBuildSnapshot } from '../../src/types/domain.js'

export interface JenkinsBuildInput {
  commitMessage?: string
  changedFiles?: string[]
  status?: 'success' | 'failure'
  branch?: string
  commitId?: string
  buildNumber?: number
}

export interface JenkinsBuildResult {
  build: BuildHistory
  snapshots: RequirementBuildSnapshot[]
  updatedRequirements: string[]
}

function randomHex(len = 7): string {
  return Math.random().toString(16).slice(2, 2 + len)
}

export function processJenkinsBuild(input: JenkinsBuildInput): JenkinsBuildResult {
  const state = loadDb()
  const lastBuild = state.builds.sort((a, b) => b.buildNumber - a.buildNumber)[0]
  const buildNumber = input.buildNumber ?? (lastBuild?.buildNumber ?? 139) + 1

  const commitMessage = input.commitMessage ?? 'CI build'
  const changedFiles = input.changedFiles ?? []
  const status = input.status ?? 'success'
  const branch = input.branch ?? 'main'
  const commitId = input.commitId ?? randomHex(7)

  const fromMessage = parseRequirementIds(commitMessage)
  const fromFiles = mapFilesToRequirements(changedFiles)
  const affectedIds = [...new Set([...fromMessage, ...fromFiles])]

  const delta = status === 'success' ? 3 : -1
  const snapshots: RequirementBuildSnapshot[] = []
  const updatedRequirements: string[] = []
  const now = new Date().toISOString()

  let totalProgress = 0
  let reqCount = 0

  mutate((s) => {
    for (const reqId of affectedIds) {
      const idx = s.requirements.findIndex((r) => r.id === reqId)
      if (idx === -1) continue

      const detail = s.validationDetails.find((d) => d.requirementId === reqId)
      const baseScore = detail
        ? scoreFromValidationDetail(detail)
        : s.requirements[idx].implementationScore

      const prevSnapshot = s.snapshots
        .filter((snap) => snap.requirementId === reqId)
        .sort((a, b) => b.buildNumber - a.buildNumber)[0]

      const prevProgress = prevSnapshot?.progress ?? s.requirements[idx].implementationScore
      const newProgress =
        status === 'success'
          ? bumpScore(Math.max(baseScore, prevProgress), delta)
          : bumpScore(prevProgress, delta)

      s.requirements[idx] = {
        ...s.requirements[idx],
        implementationScore: newProgress,
        updatedAt: now,
      }

      const snapshot: RequirementBuildSnapshot = {
        buildNumber,
        requirementId: reqId,
        progress: newProgress,
        createdAt: now,
      }
      s.snapshots.push(snapshot)
      snapshots.push(snapshot)
      updatedRequirements.push(reqId)

      if (detail) {
        detail.buildVerification = {
          buildNumber,
          status: status === 'success' ? 'verified' : 'failed',
          scoreAtBuild: newProgress,
          commitId,
          commitMessage,
        }
      }

      totalProgress += newProgress
      reqCount++
    }

    const prevOverall = lastBuild?.requirementProgress ?? 50
    const requirementProgress =
      reqCount > 0
        ? Math.round(totalProgress / reqCount)
        : prevOverall

    const build: BuildHistory = {
      id: `BH-${String(buildNumber).padStart(3, '0')}`,
      projectId: getProjectId(),
      buildNumber,
      status,
      branch,
      commitId,
      commitMessage,
      testResult: status === 'success' ? 'passed' : 'failed',
      testPassed: status === 'success' ? 24 : 18,
      testTotal: 26,
      requirementProgress,
      progressChange: requirementProgress - prevOverall,
      changedRequirements: affectedIds,
      failedRequirements: status === 'failure' ? affectedIds.slice(0, 1) : [],
      relatedFiles: changedFiles,
      duration: `${3 + Math.floor(Math.random() * 3)}m ${10 + Math.floor(Math.random() * 50)}s`,
      createdAt: now,
    }

    s.builds.push(build)
    s.webhookEvents.push({
      id: `WH-${Date.now()}`,
      source: 'jenkins',
      payload: input,
      createdAt: now,
      summary: `빌드 #${buildNumber} — ${affectedIds.length}개 요구사항 업데이트`,
    })
  })

  const build = loadDb().builds.find((b) => b.buildNumber === buildNumber)!
  return { build, snapshots, updatedRequirements }
}

export function processGitHubPush(payload: {
  commits?: { message?: string; id?: string; added?: string[]; modified?: string[]; removed?: string[] }[]
  ref?: string
}): JenkinsBuildResult {
  const commits = payload.commits ?? []
  const commitMessage = commits.map((c) => c.message).join('\n') || 'GitHub push'
  const changedFiles = commits.flatMap((c) => [
    ...(c.added ?? []),
    ...(c.modified ?? []),
    ...(c.removed ?? []),
  ])
  const commitId = commits[commits.length - 1]?.id?.slice(0, 7) ?? randomHex(7)
  const branch = (payload.ref ?? 'refs/heads/main').replace('refs/heads/', '')

  const result = processJenkinsBuild({
    commitMessage,
    changedFiles,
    status: 'success',
    branch,
    commitId,
  })

  mutate((s) => {
    s.webhookEvents.push({
      id: `WH-GH-${Date.now()}`,
      source: 'github',
      payload,
      createdAt: new Date().toISOString(),
      summary: `GitHub push → 빌드 #${result.build.buildNumber}`,
    })
  })

  return result
}

import { Router } from 'express'
import { loadDb } from '../db/store.js'
import { processGitHubPush, processJenkinsBuild } from '../services/jenkins.js'

export const webhooksRouter = Router()

webhooksRouter.post('/github', (req, res) => {
  const event = req.headers['x-github-event']
  if (event !== 'push') {
    return res.json({ data: { skipped: true, reason: `Ignored event: ${event}` } })
  }

  try {
    const result = processGitHubPush(req.body)
    res.status(201).json({
      data: {
        buildNumber: result.build.buildNumber,
        updatedRequirements: result.updatedRequirements,
        build: result.build,
      },
    })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

webhooksRouter.post('/jenkins', (req, res) => {
  const body = req.body as {
    build?: { number?: number; status?: string; branch?: string }
    changeSet?: { items?: { msg?: string; affectedPaths?: string[] }[] }
    scm?: { commit?: string; message?: string; changedFiles?: string[] }
  }

  const commitMessage =
    body.scm?.message ??
    body.changeSet?.items?.map((i) => i.msg).join('\n') ??
    'Jenkins build'

  const changedFiles =
    body.scm?.changedFiles ??
    body.changeSet?.items?.flatMap((i) => i.affectedPaths ?? []) ??
    []

  const status =
    body.build?.status === 'FAILURE' || body.build?.status === 'failure'
      ? 'failure'
      : 'success'

  try {
    const result = processJenkinsBuild({
      buildNumber: body.build?.number,
      commitMessage,
      changedFiles,
      status,
      branch: body.build?.branch ?? 'main',
      commitId: body.scm?.commit?.slice(0, 7),
    })

    res.status(201).json({
      data: {
        buildNumber: result.build.buildNumber,
        updatedRequirements: result.updatedRequirements,
        build: result.build,
      },
    })
  } catch (err) {
    res.status(500).json({ error: String(err) })
  }
})

webhooksRouter.get('/events', (_req, res) => {
  const events = [...loadDb().webhookEvents].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )
  res.json({ data: events.slice(0, 50) })
})

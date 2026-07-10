import { Body, Controller, Get, Headers, Post, Res } from '@nestjs/common'
import { StoreService } from '../core/store.service.js'
import { JenkinsService } from '../core/jenkins.service.js'
import { apiError } from '../core/http-error.js'

/**
 * Minimal structural type for the response object injected via `@Res()`. Avoids a
 * direct dependency on express types while still typing the methods we call.
 */
interface HttpResponse {
  status(code: number): HttpResponse
  json(body: unknown): HttpResponse
}

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly store: StoreService,
    private readonly jenkins: JenkinsService,
  ) {}

  // Uses @Res because the response status is conditional (200 when skipped,
  // 201 when a build is created) — matching the original Express behavior.
  @Post('github')
  github(
    @Headers('x-github-event') event: string | undefined,
    @Body() payload: unknown,
    @Res() res: HttpResponse,
  ) {
    if (event !== 'push') {
      return res.json({ data: { skipped: true, reason: `Ignored event: ${event}` } })
    }

    try {
      const result = this.jenkins.processGitHubPush(payload as never)
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
  }

  @Post('jenkins')
  jenkinsBuild(
    @Body()
    body: {
      build?: { number?: number; status?: string; branch?: string }
      changeSet?: { items?: { msg?: string; affectedPaths?: string[] }[] }
      scm?: { commit?: string; message?: string; changedFiles?: string[] }
    },
  ) {
    const commitMessage =
      body.scm?.message ??
      body.changeSet?.items?.map((i) => i.msg).join('\n') ??
      'Jenkins build'

    const changedFiles =
      body.scm?.changedFiles ??
      body.changeSet?.items?.flatMap((i) => i.affectedPaths ?? []) ??
      []

    const status =
      body.build?.status === 'FAILURE' || body.build?.status === 'failure' ? 'failure' : 'success'

    try {
      const result = this.jenkins.processBuild({
        buildNumber: body.build?.number,
        commitMessage,
        changedFiles,
        status,
        branch: body.build?.branch ?? 'main',
        commitId: body.scm?.commit?.slice(0, 7),
      })

      return {
        data: {
          buildNumber: result.build.buildNumber,
          updatedRequirements: result.updatedRequirements,
          build: result.build,
        },
      }
    } catch (err) {
      throw apiError(500, String(err))
    }
  }

  @Get('events')
  events() {
    const events = [...this.store.loadDb().webhookEvents].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    )
    return { data: events.slice(0, 50) }
  }
}

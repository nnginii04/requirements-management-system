import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { StoreService } from '../core/store.service.js'
import { JenkinsService } from '../core/jenkins.service.js'
import { apiError } from '../core/http-error.js'
import { SimulateBuildDto } from './dto/build.dto.js'

@Controller('builds')
export class BuildsController {
  constructor(
    private readonly store: StoreService,
    private readonly jenkins: JenkinsService,
  ) {}

  @Get()
  list() {
    const builds = [...this.store.loadDb().builds].sort((a, b) => b.buildNumber - a.buildNumber)
    return { data: builds }
  }

  @Get(':buildNumber')
  detail(@Param('buildNumber') buildNumberRaw: string) {
    const buildNumber = Number(buildNumberRaw)
    const build = this.store.loadDb().builds.find((b) => b.buildNumber === buildNumber)
    if (!build) throw apiError(404, 'Build not found')
    return { data: build }
  }

  @Get(':buildNumber/snapshots')
  snapshots(@Param('buildNumber') buildNumberRaw: string) {
    const buildNumber = Number(buildNumberRaw)
    const snapshots = this.store.loadDb().snapshots.filter((s) => s.buildNumber === buildNumber)
    return { data: snapshots }
  }

  @Get('requirements/:requirementId/timeline')
  timeline(@Param('requirementId') requirementId: string) {
    const snapshots = this.store
      .loadDb()
      .snapshots.filter((s) => s.requirementId === requirementId)
      .sort((a, b) => a.buildNumber - b.buildNumber)
    return { data: snapshots }
  }

  /** Simulate a Jenkins build for local testing. */
  @Post('simulate')
  simulate(@Body() body: SimulateBuildDto) {
    const result = this.jenkins.processBuild({
      commitMessage: body.commitMessage ?? 'feat: REQ-001 auth improvements',
      changedFiles: body.changedFiles ?? ['src/auth/AuthController.java'],
      status: body.status ?? 'success',
    })
    return { data: result }
  }
}

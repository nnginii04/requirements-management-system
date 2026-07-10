import { Controller, Get, Inject, Param } from '@nestjs/common'
import { StoreService } from '../core/store.service.js'

@Controller('versions')
export class VersionsController {
  constructor(@Inject(StoreService) private readonly store: StoreService) {}

  @Get()
  list() {
    return { data: this.store.loadDb().versions }
  }

  @Get('requirements/:requirementId')
  forRequirement(@Param('requirementId') requirementId: string) {
    const versions = this.store
      .loadDb()
      .versions.filter((v) => v.requirementId === requirementId)
    return { data: versions }
  }
}

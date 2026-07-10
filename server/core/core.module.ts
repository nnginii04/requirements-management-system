import { Global, Module } from '@nestjs/common'
import { StoreService } from './store.service.js'
import { RecomputeService } from './recompute.service.js'
import { JenkinsService } from './jenkins.service.js'
import { DocumentsService } from './documents.service.js'

/**
 * Global module exposing the shared data-access and domain services so every
 * feature controller can inject them without re-declaring providers.
 */
@Global()
@Module({
  providers: [StoreService, RecomputeService, JenkinsService, DocumentsService],
  exports: [StoreService, RecomputeService, JenkinsService, DocumentsService],
})
export class CoreModule {}

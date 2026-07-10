import { Module } from '@nestjs/common'
import { CoreModule } from './core/core.module.js'
import { MetaController } from './modules/meta.controller.js'
import { RequirementsController } from './modules/requirements.controller.js'
import { VersionsController } from './modules/versions.controller.js'
import { UsersController } from './modules/users.controller.js'
import { ProjectsController } from './modules/projects.controller.js'
import { AnalysisController } from './modules/analysis.controller.js'
import { BuildsController } from './modules/builds.controller.js'
import { DashboardController } from './modules/dashboard.controller.js'
import { TraceabilityController } from './modules/traceability.controller.js'
import { ValidationController } from './modules/validation.controller.js'
import { DocumentsController } from './modules/documents.controller.js'
import { WebhooksController } from './modules/webhooks.controller.js'

@Module({
  imports: [CoreModule],
  controllers: [
    MetaController,
    RequirementsController,
    VersionsController,
    UsersController,
    ProjectsController,
    AnalysisController,
    BuildsController,
    DashboardController,
    TraceabilityController,
    ValidationController,
    DocumentsController,
    WebhooksController,
  ],
})
export class AppModule {}

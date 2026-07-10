import { Injectable } from '@nestjs/common'
import {
  recomputeProjectAnalysis,
  recomputeProjectValidation,
  recomputeRequirementValidation,
} from '../services/recompute.js'

/** Injectable wrapper over the analysis/validation recompute engine. */
@Injectable()
export class RecomputeService {
  projectAnalysis(projectId: string) {
    return recomputeProjectAnalysis(projectId)
  }

  projectValidation(projectId: string) {
    return recomputeProjectValidation(projectId)
  }

  requirementValidation(requirementId: string) {
    return recomputeRequirementValidation(requirementId)
  }
}

import { Controller, Get, Inject, Param } from '@nestjs/common'
import { StoreService } from '../core/store.service.js'
import { apiError } from '../core/http-error.js'
import {
  calculateEstimatedScore,
  calculateSimilarityAverage,
  getValidationStatus,
} from '../../src/utils/validation.js'
import { calculateOverallProgress } from '../../src/utils/requirement.js'

@Controller('dashboard')
export class DashboardController {
  constructor(@Inject(StoreService) private readonly store: StoreService) {}

  private validationPayload(requirementId: string) {
    const state = this.store.loadDb()
    const requirement = state.requirements.find((r) => r.id === requirementId)
    if (!requirement) return null

    const detail = state.validationDetails.find((d) => d.requirementId === requirementId)
    if (!detail) {
      return {
        requirement,
        detail: null,
        estimated: requirement.implementationScore,
        similarityAvg: 0,
        validationStatus: getValidationStatus(requirement.implementationScore),
      }
    }

    const estimated = calculateEstimatedScore(detail.matches, detail.acceptanceCriteriaStatus)
    const similarityAvg = calculateSimilarityAverage(detail.matches)

    return {
      requirement,
      detail,
      estimated,
      similarityAvg,
      validationStatus: getValidationStatus(estimated),
    }
  }

  private traceabilitySummary(projectId: string) {
    const records = this.store
      .loadDb()
      .traceabilityRecords.filter((record) => record.projectId === projectId)
    const docs = new Set<string>()
    const code = new Set<string>()
    const builds = new Set<string>()
    const tests = new Set<string>()
    records.forEach((record) => {
      record.linkedDocuments.forEach((value) => docs.add(value))
      record.linkedCodeFiles.forEach((value) => code.add(value))
      record.linkedBuilds.forEach((value) => builds.add(value))
      record.linkedTests.forEach((value) => tests.add(value))
    })
    const covered = records.filter((record) => record.linkStatus !== 'missing').length
    const matrixCoverageRate = records.length > 0 ? Math.round((covered / records.length) * 100) : 0

    return {
      linkedDocumentsCount: docs.size,
      linkedCodeFilesCount: code.size,
      linkedBuildsCount: builds.size,
      linkedTestsCount: tests.size,
      matrixCoverageRate,
    }
  }

  @Get('projects/:projectId')
  dashboard(@Param('projectId') projectId: string) {
    const state = this.store.loadDb()
    const project = state.projects.find((item) => item.id === projectId)
    if (!project) throw apiError(404, 'Project not found')

    const requirements = state.requirements.filter((item) => item.projectId === projectId)
    const builds = state.builds
      .filter((item) => item.projectId === projectId)
      .sort((a, b) => a.buildNumber - b.buildNumber)
    const findings = state.analysisFindings.filter((finding) =>
      finding.requirementIds.some((id) => requirements.some((req) => req.id === id)),
    )

    const requirementCoverage = requirements.map((requirement) => {
      const validation = this.validationPayload(requirement.id)
      const hasHighSeverityFinding = findings.some(
        (finding) =>
          finding.requirementIds.includes(requirement.id) &&
          (finding.severity === 'high' || finding.severity === 'critical'),
      )
      const estimatedImplementationScore = validation?.estimated ?? requirement.implementationScore
      const validationStatus =
        validation?.validationStatus ?? getValidationStatus(estimatedImplementationScore)
      const reviewNeeded =
        requirement.status === 'in_review' ||
        hasHighSeverityFinding ||
        ((validationStatus === 'partially_implemented' ||
          validationStatus === 'not_implemented') &&
          (requirement.priority === 'high' || requirement.priority === 'critical'))

      return {
        requirementId: requirement.id,
        title: requirement.title,
        type: requirement.type,
        priority: requirement.priority,
        status: requirement.status,
        estimatedImplementationScore,
        validationStatus,
        reviewNeeded,
      }
    })

    const implementedCount = requirementCoverage.filter(
      (item) => item.validationStatus === 'implemented',
    ).length
    const mostlyImplementedCount = requirementCoverage.filter(
      (item) => item.validationStatus === 'mostly_implemented',
    ).length
    const partiallyImplementedCount = requirementCoverage.filter(
      (item) => item.validationStatus === 'partially_implemented',
    ).length
    const notImplementedCount = requirementCoverage.filter(
      (item) => item.validationStatus === 'not_implemented',
    ).length
    const reviewNeededCount = requirementCoverage.filter((item) => item.reviewNeeded).length

    const prioritizedValidation = [...requirementCoverage].sort((a, b) => {
      const aPriority = a.priority === 'critical' || a.priority === 'high' ? 0 : 1
      const bPriority = b.priority === 'critical' || b.priority === 'high' ? 0 : 1
      if (a.reviewNeeded !== b.reviewNeeded) return a.reviewNeeded ? -1 : 1
      if (aPriority !== bPriority) return aPriority - bPriority
      return a.estimatedImplementationScore - b.estimatedImplementationScore
    })[0]

    const validationSummary = prioritizedValidation
      ? (() => {
          const validation = this.validationPayload(prioritizedValidation.requirementId)
          if (!validation) return null
          return {
            requirementId: prioritizedValidation.requirementId,
            requirementTitle: prioritizedValidation.title,
            estimatedImplementationScore: validation.estimated,
            validationStatus: validation.validationStatus,
            similarityAverage: Math.round(validation.similarityAvg * 100) / 100,
            matchedFilesCount:
              validation.detail?.matches.filter((match) => match.score >= 0.4).length ?? 0,
            missingLogicCount: validation.detail?.missingLogic.length ?? 0,
            relatedCodeFiles:
              validation.detail?.matches
                .filter((match) => match.score >= 0.4)
                .map((match) => match.displayName)
                .slice(0, 4) ?? [],
            aiExplanation: validation.detail?.aiExplanation ?? '검증 데이터가 없습니다.',
          }
        })()
      : null

    const latestBuild = [...builds].sort((a, b) => b.buildNumber - a.buildNumber)[0]

    return {
      data: {
        projectSummary: {
          projectId,
          projectName: project.name,
          overallProgress: calculateOverallProgress(requirements),
          totalRequirements: requirements.length,
          functionalRequirements: requirements.filter((item) => item.type === 'functional').length,
          nonFunctionalRequirements: requirements.filter((item) => item.type === 'non_functional')
            .length,
          implementedCount,
          mostlyImplementedCount,
          partiallyImplementedCount,
          notImplementedCount,
          reviewNeededCount,
          generatedDocumentsCount: state.generatedDocuments.filter(
            (item) => item.projectId === projectId,
          ).length,
          latestBuildNumber: latestBuild?.buildNumber ?? null,
          latestBuildStatus: latestBuild?.status ?? null,
        },
        requirementCoverage,
        aiInsights: {
          duplicateCount: findings.filter((item) => item.type === 'duplicate').length,
          conflictCount: findings.filter((item) => item.type === 'conflict').length,
          missingCount: findings.filter((item) => item.type === 'omission').length,
          traceabilityGapCount: findings.filter((item) => item.type === 'traceability_gap').length,
          highSeverityFindings: findings.filter(
            (item) => item.severity === 'high' || item.severity === 'critical',
          ).length,
          recentFindings: [...findings].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5),
        },
        buildTimeline: builds.map((build) => ({
          buildNumber: build.buildNumber,
          buildStatus: build.status,
          requirementProgress: build.requirementProgress,
          progressChange: build.progressChange,
          createdAt: build.createdAt,
        })),
        validationSummary,
        traceabilitySummary: this.traceabilitySummary(projectId),
      },
    }
  }
}

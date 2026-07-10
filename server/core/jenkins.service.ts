import { Injectable } from '@nestjs/common'
import {
  processGitHubPush,
  processJenkinsBuild,
  type JenkinsBuildInput,
} from '../services/jenkins.js'

/** Injectable wrapper over the Jenkins build / GitHub push processing. */
@Injectable()
export class JenkinsService {
  processBuild(input: JenkinsBuildInput) {
    return processJenkinsBuild(input)
  }

  processGitHubPush(payload: Parameters<typeof processGitHubPush>[0]) {
    return processGitHubPush(payload)
  }
}

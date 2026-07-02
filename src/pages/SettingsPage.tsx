import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { GitBranch, Hammer, Link2, Shield, Sparkles } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useApp } from '@/contexts/AppContext'
import { useWorkflow } from '@/hooks/useWorkflow'
import { loadSettingsData } from '@/utils/settingsApi'
import type { Baseline } from '@/types'
import type { IntegrationStatus, ProjectView } from '@/api/types'

export function SettingsPage() {
  const workflow = useWorkflow()
  const { activeProjectId, currentUser, apiConnected } = useApp()
  const [project, setProject] = useState<ProjectView | null>(null)
  const [baselines, setBaselines] = useState<Baseline[]>([])
  const [integrations, setIntegrations] = useState<IntegrationStatus | null>(null)

  useEffect(() => {
    let cancelled = false
    loadSettingsData(activeProjectId, apiConnected).then((data) => {
      if (cancelled) return
      setProject(data.project)
      setBaselines(data.baselines)
      setIntegrations(data.integrations)
    })
    return () => {
      cancelled = true
    }
  }, [activeProjectId, apiConnected])

  const projectInfo = project

  return (
    <PageContainer
      title={workflow.title}
      description={workflow.subtitle}
      workflow={workflow}
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <SectionHeader
            title="프로젝트 정보"
            description="요구사항 엔지니어링 프로젝트 메타데이터"
          />
          {projectInfo && (
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-text-secondary">프로젝트명</dt>
                <dd className="text-right font-medium text-text-primary">{projectInfo.name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-text-secondary">요구사항 수</dt>
                <dd className="font-medium text-text-primary">
                  {projectInfo.totalRequirements ?? 0}개
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-text-secondary">추정 구현 점수</dt>
                <dd className="font-medium text-primary">~{projectInfo.progress ?? 0}%</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-text-secondary">팀 멤버</dt>
                <dd className="font-medium text-text-primary">
                  {projectInfo.memberCount ?? 0}명
                </dd>
              </div>
            </dl>
          )}
        </Card>

        <Card>
          <SectionHeader title="사용자 정보" />
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-text-secondary">이름</dt>
              <dd className="font-medium text-text-primary">{currentUser.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-secondary">이메일</dt>
              <dd className="font-medium text-text-primary">{currentUser.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-secondary">역할</dt>
              <dd className="font-medium text-text-primary">{currentUser.role}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <Card className="mt-4">
        <SectionHeader
          title="베이스라인 관리"
          description="요구사항 스냅샷 · 릴리스 기준점 관리"
        />
        <div className="mt-4 space-y-3">
          {baselines.map((bl) => (
            <div
              key={bl.id}
              className="flex flex-col gap-2 rounded-lg border border-border bg-background px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-text-primary">{bl.name}</p>
                <p className="text-xs text-text-secondary">
                  v{bl.version} · {bl.requirements.length}개 요구사항 · {bl.createdAt.slice(0, 10)}
                </p>
              </div>
              <Badge variant="outline">베이스라인</Badge>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-text-secondary">
          베이스라인은 특정 시점의 요구사항 집합을 고정하여 버전 이력과 비교·추적합니다.
        </p>
      </Card>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <SectionHeader
            title="요구사항 추적성"
            description="요구사항 ↔ 문서 ↔ 코드 ↔ 빌드 연결 설정"
          />
          <ul className="mt-4 space-y-2 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                <Link to="/requirements" className="font-medium text-primary hover:underline">
                  요구사항 관리
                </Link>
                에서 추적성 매트릭스 및 문서 연결 확인
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
              <span>
                <Link to="/validation" className="font-medium text-primary hover:underline">
                  구현 검증
                </Link>
                에서 요구사항-코드 유사도 및 코드 관계 확인
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Hammer className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                <Link to="/build-history" className="font-medium text-primary hover:underline">
                  Jenkins 빌드 이력
                </Link>
                에서 진척 타임라인 및 빌드별 스냅샷 확인
              </span>
            </li>
          </ul>
        </Card>

        <Card>
          <SectionHeader title="외부 연동" description="Jenkins · Git · AI 분석 엔진 연동 상태" />
          {integrations && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <div className="flex items-center gap-3">
                  <Hammer className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">Jenkins</p>
                    <p className="text-xs text-text-secondary">{integrations.jenkins.label}</p>
                  </div>
                </div>
                <Badge variant={integrations.jenkins.connected ? 'secondary' : 'outline'}>
                  {integrations.jenkins.connected ? '연결됨' : '미연결'}
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <div className="flex items-center gap-3">
                  <GitBranch className="h-5 w-5 text-secondary" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">Git 저장소</p>
                    <p className="text-xs text-text-secondary">{integrations.git.label}</p>
                  </div>
                </div>
                <Badge variant={integrations.git.connected ? 'secondary' : 'outline'}>
                  {integrations.git.connected ? '연결됨' : '미연결'}
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-success" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">AI 분석 엔진</p>
                    <p className="text-xs text-text-secondary">{integrations.aiEngine.label}</p>
                  </div>
                </div>
                <Badge variant={integrations.aiEngine.connected ? 'success' : 'outline'}>
                  {integrations.aiEngine.connected ? '활성' : '대기'}
                </Badge>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-4" padding="lg">
        <p className="text-sm text-text-secondary">
          버전 이력, 베이스라인, 추적성 매트릭스 설정은{' '}
          <Link to="/requirements" className="font-medium text-primary hover:underline">
            요구사항 관리
          </Link>
          페이지에서 요구사항 단위로 관리됩니다.
        </p>
      </Card>
    </PageContainer>
  )
}

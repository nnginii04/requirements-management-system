import { Outlet, useLocation, Link } from 'react-router-dom'
import { Sidebar } from '@/layouts/Sidebar'
import { TopHeader } from '@/layouts/TopHeader'
import { LifecycleStepper } from '@/components/lifecycle/LifecycleStepper'
import { getLifecycleStageForPath } from '@/config/workflow'

export function AppLayout() {
  const { pathname } = useLocation()
  const currentStage = getLifecycleStageForPath(pathname)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader />

        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin sm:px-6 sm:py-6">
            <Outlet />
          </div>

          <div className="shrink-0 border-t border-border bg-background px-4 py-3 sm:px-6 sm:py-4">
            <div className="mb-2 hidden items-center justify-between sm:flex">
              <p className="text-[10px] text-text-secondary">
                워크플로: 도출 → 분석 → 명세화 → 검증 → 추적
              </p>
              <Link to="/dashboard" className="text-[10px] font-medium text-primary hover:underline">
                요구사항 엔지니어링 대시보드
              </Link>
            </div>
            <LifecycleStepper currentStage={currentStage} />
          </div>
        </main>
      </div>
    </div>
  )
}

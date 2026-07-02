import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '@/layouts/Sidebar'
import { TopHeader } from '@/layouts/TopHeader'
import { LifecycleStepper } from '@/components/lifecycle/LifecycleStepper'
import { getLifecycleStageForPath } from '@/config/workflow'

export function AppLayout() {
  const { pathname } = useLocation()
  const currentStage = getLifecycleStageForPath(pathname)
  /** 3열 패널 — 페이지 스크롤 대신 패널 내부 스크롤 (요구사항 목록만) */
  const panelRoutes = new Set(['/requirements'])
  const isPanelView = panelRoutes.has(pathname)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader />

        <main className="flex flex-1 flex-col overflow-hidden">
          <div
            className={
              isPanelView
                ? 'flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-3 sm:px-6 sm:py-4'
                : 'min-h-0 flex-1 overflow-y-auto px-4 py-3 scrollbar-thin sm:px-6 sm:py-4'
            }
          >
            <Outlet />
          </div>

          <div className="shrink-0 border-t border-border bg-background px-4 py-2 sm:px-6">
            <LifecycleStepper currentStage={currentStage} compact />
          </div>
        </main>
      </div>
    </div>
  )
}

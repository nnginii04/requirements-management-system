import { useNavigate } from 'react-router-dom'
import { Search, Sparkles, Download, ChevronDown } from 'lucide-react'
import { currentProject, currentUser } from '@/mocks'
import { MobileNav } from '@/layouts/Sidebar'

export function TopHeader() {
  const navigate = useNavigate()

  return (
    <header className="shrink-0 border-b border-border bg-card">
      <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">
            요구사항 엔지니어링 플랫폼
          </p>
          <h1 className="truncate text-sm font-semibold text-text-primary sm:text-base">
            {currentProject.name}
          </h1>
        </div>

        <div className="hidden flex-1 items-center justify-center px-4 md:flex">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <input
              type="search"
              placeholder="요구사항, 문서, 코드, 추적성 검색..."
              className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/analysis')}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">AI 분석</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/documents')}
            className="hidden h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-medium text-text-primary transition-colors hover:bg-gray-50 sm:inline-flex"
          >
            <Download className="h-4 w-4" />
            SRS보내기
          </button>

          <button
            type="button"
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-white">
              {currentUser.avatarInitials}
            </div>
            <div className="hidden text-left lg:block">
              <p className="text-sm font-medium text-text-primary">{currentUser.name}</p>
              <p className="text-[11px] text-text-secondary">{currentUser.role}</p>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-text-secondary lg:block" />
          </button>
        </div>
      </div>
      <MobileNav />
    </header>
  )
}

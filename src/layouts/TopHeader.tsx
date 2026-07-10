import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Sparkles, Download, ChevronDown, LogOut } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { logout } from '@/api/auth'
import { cn } from '@/utils/cn'
import { MobileNav } from '@/layouts/Sidebar'

export function TopHeader() {
  const navigate = useNavigate()
  const { currentProject, currentUser, users, setCurrentUser } = useApp()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

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

          <div className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-50"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-white">
                {currentUser.avatarInitials}
              </div>
              <div className="hidden text-left lg:block">
                <p className="text-sm font-medium text-text-primary">{currentUser.name}</p>
                <p className="text-[11px] text-text-secondary">{currentUser.role}</p>
              </div>
              <ChevronDown
                className={cn(
                  'hidden h-4 w-4 text-text-secondary lg:block transition-transform',
                  userMenuOpen && 'rotate-180',
                )}
              />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full z-30 mt-1 min-w-[180px] rounded-lg border border-border bg-card py-1 shadow-lg">
                {users.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      void setCurrentUser(u.id)
                      setUserMenuOpen(false)
                    }}
                    className={cn(
                      'block w-full px-3 py-2 text-left text-sm hover:bg-gray-50',
                      u.id === currentUser.id ? 'font-medium text-primary' : 'text-text-primary',
                    )}
                  >
                    {u.name}
                    <span className="ml-1 text-xs text-text-secondary">({u.role})</span>
                  </button>
                ))}
                <div className="my-1 h-px bg-border" />
                <button
                  type="button"
                  onClick={() => logout()}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <MobileNav />
    </header>
  )
}

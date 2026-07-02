import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Sparkles,
  BookOpen,
  ShieldCheck,
  History,
  Settings,
  Hexagon,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useApp } from '@/contexts/AppContext'

const navGroups = [
  {
    label: '개요',
    items: [
      { label: '엔지니어링 대시보드', path: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: '도출 및 관리',
    items: [
      { label: '요구사항', path: '/requirements', icon: FileText, end: true },
      { label: '새 요구사항', path: '/requirements/new', icon: PlusCircle },
    ],
  },
  {
    label: '분석 및 명세화',
    items: [
      { label: 'AI 분석', path: '/analysis', icon: Sparkles },
      { label: '문서 (SRS/PRD/BRS)', path: '/documents', icon: BookOpen },
    ],
  },
  {
    label: '검증 및 추적',
    items: [
      { label: '구현 검증', path: '/validation', icon: ShieldCheck },
      { label: '빌드 이력', path: '/build-history', icon: History },
    ],
  },
  {
    label: '시스템',
    items: [
      { label: '설정', path: '/settings', icon: Settings },
    ],
  },
]

export function Sidebar() {
  const { projects, activeProjectId, currentProject, setActiveProject, apiConnected } = useApp()
  const [projectMenuOpen, setProjectMenuOpen] = useState(false)

  return (
    <aside className="hidden h-full w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Hexagon className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-text-primary">ReqFlow</p>
          <p className="truncate text-[11px] text-text-secondary">요구사항 엔지니어링</p>
        </div>
      </div>

      <div className="relative border-b border-border px-4 py-3">
        <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
          현재 프로젝트
        </p>
        <button
          type="button"
          onClick={() => setProjectMenuOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-2 rounded-lg px-1 py-0.5 text-left hover:bg-gray-50"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text-primary">{currentProject.name}</p>
            <p className="mt-0.5 text-xs text-text-secondary">
              {currentProject.totalRequirements ?? 0}개 · ~{currentProject.progress ?? 0}% 추정
            </p>
          </div>
          {projects.length > 1 && (
            <ChevronDown
              className={cn(
                'h-4 w-4 shrink-0 text-text-secondary transition-transform',
                projectMenuOpen && 'rotate-180',
              )}
            />
          )}
        </button>

        {projectMenuOpen && projects.length > 1 && (
          <div className="absolute left-4 right-4 top-full z-20 mt-1 rounded-lg border border-border bg-card py-1 shadow-lg">
            {projects.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  void setActiveProject(p.id)
                  setProjectMenuOpen(false)
                }}
                className={cn(
                  'block w-full px-3 py-2 text-left text-sm hover:bg-gray-50',
                  p.id === activeProjectId
                    ? 'font-medium text-primary'
                    : 'text-text-primary',
                )}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="mb-1.5 px-3 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={'end' in item ? item.end : item.path === '/requirements'}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary',
                      )
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className={cn('h-2 w-2 rounded-full', apiConnected ? 'bg-success' : 'bg-warning')}
          />
          <span className="text-xs text-text-secondary">
            {apiConnected ? 'API 연결됨' : '오프라인 (목업)'}
          </span>
        </div>
      </div>
    </aside>
  )
}

export function MobileNav() {
  const items = navGroups.flatMap((g) => g.items)

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border bg-card px-2 py-2 md:hidden scrollbar-thin">
      {items.slice(0, 6).map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={'end' in item ? item.end : false}
          className={({ isActive }) =>
            `shrink-0 rounded-lg px-2.5 py-1.5 text-[10px] font-medium ${
              isActive ? 'bg-primary/10 text-primary' : 'text-text-secondary'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

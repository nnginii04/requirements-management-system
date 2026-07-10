import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, ShieldCheck, Sparkles } from 'lucide-react'
import { login } from '@/api/auth'

const DEMO_EMAIL = 'yejin.jung@company.com'
const DEMO_PASSWORD = 'demo1234'

export function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(nextEmail: string, nextPassword: string) {
    setBusy(true)
    setError(null)
    try {
      await login(nextEmail, nextPassword)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.')
    } finally {
      setBusy(false)
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    void submit(email, password)
  }

  function onDemo() {
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
    void submit(DEMO_EMAIL, DEMO_PASSWORD)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0064FF] text-white shadow-lg shadow-blue-200">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">ReqFlow</h1>
          <p className="mt-1 text-sm text-slate-500">요구사항 엔지니어링 플랫폼</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                이메일
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#0064FF] focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#0064FF] focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0064FF] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              <LogIn className="h-4 w-4" />
              {busy ? '로그인 중…' : '로그인'}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            또는
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={onDemo}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4 text-[#0064FF]" />
            데모 계정으로 바로 시작
          </button>

          <p className="mt-4 text-center text-xs text-slate-400">
            데모 계정: <span className="font-medium text-slate-600">{DEMO_EMAIL}</span> ·{' '}
            <span className="font-medium text-slate-600">{DEMO_PASSWORD}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

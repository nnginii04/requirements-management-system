import type { User } from '@/types'

const TOKEN_KEY = 'reqflow_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function isAuthenticated(): boolean {
  return getToken() !== null
}

export interface LoginResult {
  token: string
  user: User
}

export async function login(email: string, password: string): Promise<LoginResult> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const body = (await res.json().catch(() => ({}))) as { data?: LoginResult; error?: string }
  if (!res.ok || !body.data) {
    throw new Error(body.error ?? '로그인에 실패했습니다.')
  }
  setToken(body.data.token)
  return body.data
}

export function logout(): void {
  clearToken()
  window.location.assign('/login')
}

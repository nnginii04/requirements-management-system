import { test, expect } from '@playwright/test'

const DEMO = { email: 'yejin.jung@company.com', password: 'demo1234' }

test.describe('ReqFlow smoke', () => {
  // Authenticate by seeding a valid token before the app loads.
  test.beforeEach(async ({ page, request }) => {
    const res = await request.post('http://localhost:3001/api/auth/login', { data: DEMO })
    const { data } = await res.json()
    await page.addInitScript((token) => {
      window.localStorage.setItem('reqflow_token', token)
    }, data.token)
  })

  test('dashboard loads with project title', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(
      page.getByRole('main').getByRole('heading', { name: '엔터프라이즈 사용자 포털' }),
    ).toBeVisible()
  })

  test('requirements page shows list', async ({ page }) => {
    await page.goto('/requirements')
    await expect(page.getByText('요구사항', { exact: false }).first()).toBeVisible()
  })

  test('analysis page loads AI section', async ({ page }) => {
    await page.goto('/analysis')
    await expect(page.getByText('AI 요구사항 분석')).toBeVisible()
  })

  test('settings page shows project info', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByText('프로젝트 정보')).toBeVisible()
    await expect(page.getByRole('main').getByText('정예진')).toBeVisible()
  })

  test('API health endpoint responds', async ({ request }) => {
    const res = await request.get('http://localhost:3001/api/health')
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.status).toBe('ok')
  })
})

test.describe('auth', () => {
  test('unauthenticated visit redirects to login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('demo login opens the dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: '데모 계정으로 바로 시작' }).click()
    await expect(
      page.getByRole('main').getByRole('heading', { name: '엔터프라이즈 사용자 포털' }),
    ).toBeVisible()
  })
})

import { test, expect } from '@playwright/test'

test.describe('ReqFlow smoke', () => {
  test('dashboard loads with project title', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByRole('heading', { name: '엔터프라이즈 사용자 포털' })).toBeVisible()
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
    await expect(page.getByText('정예진')).toBeVisible()
  })

  test('API health endpoint responds', async ({ request }) => {
    const res = await request.get('http://localhost:3001/api/health')
    expect(res.ok()).toBeTruthy()
    const body = await res.json()
    expect(body.status).toBe('ok')
  })
})

import { createBrowserRouter, Navigate, redirect } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { RequirementsPage } from '@/pages/RequirementsPage'
import { NewRequirementPage } from '@/pages/NewRequirementPage'
import { AnalysisPage } from '@/pages/AnalysisPage'
import { DocumentsPage } from '@/pages/DocumentsPage'
import { ValidationPage } from '@/pages/ValidationPage'
import { BuildHistoryPage } from '@/pages/BuildHistoryPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { LoginPage } from '@/pages/LoginPage'
import { isAuthenticated } from '@/api/auth'

/** Route guard: bounce unauthenticated visitors to the login screen. */
function requireAuth() {
  if (!isAuthenticated()) throw redirect('/login')
  return null
}

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <AppLayout />,
    loader: requireAuth,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'requirements', element: <RequirementsPage /> },
      { path: 'requirements/new', element: <NewRequirementPage /> },
      { path: 'analysis', element: <AnalysisPage /> },
      { path: 'documents', element: <DocumentsPage /> },
      { path: 'validation', element: <ValidationPage /> },
      { path: 'build-history', element: <BuildHistoryPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])

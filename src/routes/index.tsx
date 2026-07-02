import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { RequirementsPage } from '@/pages/RequirementsPage'
import { NewRequirementPage } from '@/pages/NewRequirementPage'
import { AnalysisPage } from '@/pages/AnalysisPage'
import { DocumentsPage } from '@/pages/DocumentsPage'
import { ValidationPage } from '@/pages/ValidationPage'
import { BuildHistoryPage } from '@/pages/BuildHistoryPage'
import { SettingsPage } from '@/pages/SettingsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
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

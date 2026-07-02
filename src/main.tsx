import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AppProvider } from '@/contexts/AppContext'
import { RequirementsProvider } from '@/contexts/RequirementsContext'
import { router } from '@/routes'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <RequirementsProvider>
        <RouterProvider router={router} />
      </RequirementsProvider>
    </AppProvider>
  </StrictMode>,
)

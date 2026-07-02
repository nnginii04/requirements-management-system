import { useLocation } from 'react-router-dom'
import { getWorkflowForPath } from '@/config/workflow'

export function useWorkflow() {
  const { pathname } = useLocation()
  return getWorkflowForPath(pathname)
}

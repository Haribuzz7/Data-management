import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-canvas">
        <Loader2 size={28} className="animate-spin text-accent" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  return <>{children}</>
}

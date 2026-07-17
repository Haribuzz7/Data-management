import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Sprout } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/Button'

export default function Auth() {
  const { session, signIn } = useAuth()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Already logged in — bounce back to wherever they came from (or Home).
  if (session) {
    const from = (location.state as { from?: Location })?.from?.pathname ?? '/'
    return <Navigate to={from} replace />
  }

  const handleTapLogin = async () => {
    setError(null)
    setSubmitting(true)

    // Hardcoded convenience login for mom
    const { error } = await signIn('siva@1970.com', 'Saisiva1970')

    setSubmitting(false)
    if (error) {
      setError(error)
    }
  }

  return (
    <div className="min-h-dvh flex flex-col justify-center px-6 py-8 max-w-sm mx-auto w-full">
      <div className="flex flex-col items-center mb-10">
        <div className="w-16 h-16 rounded-card bg-accent-soft flex items-center justify-center mb-4">
          <Sprout size={30} className="text-accent" strokeWidth={2} />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Field Log</h1>
        <p className="text-sm text-ink-muted mt-1">ICAR, Gobichettipalayam</p>
      </div>

      <div className="flex flex-col gap-4">
        {error && (
          <p role="alert" className="text-sm text-center text-danger mb-2">
            {error}
          </p>
        )}

        <Button onClick={handleTapLogin} size="lg" fullWidth loading={submitting}>
          Tap to Access Field Log
        </Button>
      </div>
    </div>
  )
}

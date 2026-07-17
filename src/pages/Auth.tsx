import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
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
    <div className="min-h-dvh flex flex-col justify-center px-6 py-8 max-w-sm mx-auto w-full relative z-10 animate-in fade-in duration-500">
      <div className="flex flex-col items-center mb-10 text-center slide-in-from-bottom duration-700 delay-150 fill-mode-both">
        <div className="w-24 h-24 rounded-full bg-white/40 shadow-card flex items-center justify-center mb-6 backdrop-blur-xl border border-white/60">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/80 to-accent text-white flex items-center justify-center text-3xl font-medium shadow-inner">
            MS
          </div>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Mrs. M. Siva</h1>
        <p className="text-sm font-medium text-accent mt-1 tracking-wide uppercase">Msc, M.phil</p>
        <p className="text-base text-ink-muted mt-3">Scientist, Home science</p>
        <p className="text-sm text-ink-faint mt-1">ICAR, Gobichettipalayam</p>
      </div>

      <div className="flex flex-col gap-4 animate-in slide-in-from-bottom duration-700 delay-300 fill-mode-both w-full">
        {error && (
          <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-control text-sm text-center shadow-sm backdrop-blur-md">
            {error}
          </div>
        )}

        <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-2 rounded-[1.25rem] shadow-raised">
          <Button onClick={handleTapLogin} size="lg" fullWidth loading={submitting} className="shadow-sm hover:shadow-md transition-shadow">
            Tap to Access Field Log
          </Button>
        </div>
      </div>
    </div>
  )
}

import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Sprout, Mail, Lock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function Auth() {
  const { session, signIn } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Already logged in — bounce back to wherever they came from (or Home).
  if (session) {
    const from = (location.state as { from?: Location })?.from?.pathname ?? '/'
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error } = await signIn(email, password)

    setSubmitting(false)
    if (error) {
      setError(
        error.toLowerCase().includes('invalid login credentials')
          ? 'Incorrect email or password.'
          : error
      )
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          type="email"
          label="Email"
          placeholder="you@example.com"
          icon={<Mail size={18} />}
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          label="Password"
          placeholder="••••••••"
          icon={<Lock size={18} />}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <p role="alert" className="text-sm text-danger -mt-1">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" fullWidth loading={submitting} className="mt-2">
          Sign in
        </Button>
      </form>
    </div>
  )
}

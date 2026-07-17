import { NavLink, Outlet } from 'react-router-dom'
import { Home, Image, Search, Calendar, CloudOff, AlertTriangle } from 'lucide-react'
import { useOfflineSync } from '@/hooks/useOfflineSync'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/gallery', label: 'Gallery', icon: Image, end: false },
  { to: '/search', label: 'Search', icon: Search, end: false },
  { to: '/calendar', label: 'Calendar', icon: Calendar, end: false },
] as const

export default function AppShell() {
  const { isOnline, pendingCount, errorCount, syncNow } = useOfflineSync()

  return (
    <div className="min-h-dvh flex bg-transparent relative">
      {/* Desktop Sidebar (hidden on mobile) */}
      <nav className="hidden md:flex flex-col w-64 border-r border-line bg-surface/80 backdrop-blur-md p-6 fixed inset-y-0 left-0 z-40">
        <div className="mb-10 px-4">
          <h1 className="text-xl font-bold tracking-tight text-ink">Field Log</h1>
          <p className="text-xs text-ink-muted mt-1">ICAR Activity Tracker</p>
        </div>
        
        <ul className="flex flex-col gap-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-card text-sm font-medium transition-colors ${
                    isActive ? 'bg-accent/10 text-accent font-semibold' : 'text-ink-muted hover:bg-canvas hover:text-ink'
                  }`
                }
              >
                <Icon size={20} strokeWidth={2.5} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col md:ml-64 min-w-0">
        {(!isOnline || pendingCount > 0 || errorCount > 0) && (
          <button
            onClick={() => syncNow()}
            className="w-full flex items-center justify-center gap-2 text-xs font-medium py-2
                       pt-[calc(0.5rem+env(safe-area-inset-top))]
                       bg-warn/10 text-warn min-h-0 sticky top-0 z-50"
          >
            {errorCount > 0 ? (
              <>
                <AlertTriangle size={14} />
                {errorCount} {errorCount === 1 ? 'entry' : 'entries'} failed to sync — click to retry
              </>
            ) : !isOnline ? (
              <>
                <CloudOff size={14} />
                Offline — {pendingCount > 0 ? `${pendingCount} saved, will sync automatically` : 'entries save locally'}
              </>
            ) : (
              <>Syncing {pendingCount} {pendingCount === 1 ? 'entry' : 'entries'}…</>
            )}
          </button>
        )}

        <main className="flex-1 pb-20 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Nav (hidden on desktop) */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/60 backdrop-blur-xl border-t border-white/60
                   px-2 pt-1 pb-[calc(0.5rem+env(safe-area-inset-bottom))]"
      >
        <ul className="flex justify-around">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 py-1.5 w-full rounded-control text-xs font-medium transition-colors ${
                    isActive ? 'text-accent' : 'text-ink-faint'
                  }`
                }
              >
                <Icon size={22} strokeWidth={2} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

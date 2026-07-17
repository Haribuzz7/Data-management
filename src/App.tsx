import { Routes, Route } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import RequireAuth from '@/components/layout/RequireAuth'
import Home from '@/pages/Home'
import NewEntry from '@/pages/NewEntry'
import Gallery from '@/pages/Gallery'
import ActivityDetail from '@/pages/ActivityDetail'
import Search from '@/pages/Search'
import Timeline from '@/pages/Timeline'
import CalendarView from '@/pages/CalendarView'
import Auth from '@/pages/Auth'

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/new" element={<NewEntry />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/activity/:id" element={<ActivityDetail />} />
        <Route path="/search" element={<Search />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/calendar" element={<CalendarView />} />
      </Route>
    </Routes>
  )
}

import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './layout/AppLayout'
import Overview from './pages/Overview'
import Tasks from './pages/Tasks'
import Tickets from './pages/Tickets'
import Backlog from './pages/Backlog'
import Calendar from './pages/Calendar'
import Approvals from './pages/Approvals'
import Agents from './pages/Agents'
import Factory from './pages/Factory'
import Activity from './pages/Activity'
import Health from './pages/Health'
import Sessions from './pages/Sessions'
import Usage from './pages/Usage'
import Logs from './pages/Logs'

/**
 * Mission Control — full userflow (13 screens, wireframe-faithful).
 * HashRouter so deep links work on any static host without rewrite rules.
 * Every sidebar item in WORKSPACE / TEAM / OBSERVE is a real route.
 */
function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Overview />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/backlog" element={<Backlog />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/factory" element={<Factory />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/health" element={<Health />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/usage" element={<Usage />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App

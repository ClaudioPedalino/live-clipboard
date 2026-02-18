import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { ClipboardPage } from './pages/ClipboardPage'
import { ToastProvider } from './components/Toast'

const PAGES = [
  { id: 'page-1', label: 'Page 1' },
  { id: 'page-2', label: 'Page 2' },
  { id: 'page-3', label: 'Page 3' },
  { id: 'page-4', label: 'Page 4' },
]

function AppContent() {
  return (
    <div className="app">
      <header className="header">
        <div className="header-brand">Live Clipboard</div>
        <nav className="nav-tabs">
          {PAGES.map((p) => (
            <NavLink
              key={p.id}
              to={`/${p.id}`}
              className={({ isActive }) => `nav-tab nav-tab--${p.id} ${isActive ? 'active' : ''}`}
            >
              {p.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="main">
        <Routes>
          <Route path="/" element={<Navigate to="/page-1" replace />} />
          {PAGES.map((p) => (
            <Route key={p.id} path={`/${p.id}`} element={<ClipboardPage pageId={p.id} />} />
          ))}
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  )
}

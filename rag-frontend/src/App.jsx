import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, createContext, useContext } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import Ask from './pages/Ask'
import Documents from './pages/Documents'
import Evaluation from './pages/Evaluation'
import Login from './pages/Login'

export const ThemeContext = createContext()
export const useTheme = () => useContext(ThemeContext)

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth0()

  if (isLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' }}>
      <div style={{ color: '#6366f1', fontSize: 18 }}>Loading...</div>
    </div>
  )

  return isAuthenticated ? children : <Navigate to="/login" />
}

export default function App() {
  const [dark, setDark] = useState(true)

  const theme = {
    dark,
    toggle: () => setDark(!dark),
    bg: dark ? '#0a0a0f' : '#f8fafc',
    bgCard: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
    border: dark ? '#1e293b' : '#e2e8f0',
    text: dark ? '#f1f5f9' : '#0f172a',
    textMuted: dark ? '#64748b' : '#94a3b8',
    textSub: dark ? '#94a3b8' : '#475569',
    navBg: dark ? 'rgba(10,10,15,0.8)' : 'rgba(248,250,252,0.8)',
  }

  return (
    <ThemeContext.Provider value={theme}>
      <BrowserRouter>
        <div style={{ minHeight: '100vh', background: theme.bg, transition: 'background 0.3s' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/ask" element={<ProtectedRoute><Ask /></ProtectedRoute>} />
                  <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
                  <Route path="/evaluation" element={<Evaluation />} />
                </Routes>
                <Footer />
              </>
            } />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeContext.Provider>
  )
}
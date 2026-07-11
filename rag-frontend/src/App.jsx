import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, createContext, useContext, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import Ask from './pages/Ask'
import Documents from './pages/Documents'
import Evaluation from './pages/Evaluation'
import Login from './pages/Login'
import DotField from './components/DotField'

export const ThemeContext = createContext()
export const useTheme = () => useContext(ThemeContext)

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth0()

  if (isLoading) return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
      <div className="text-[14px] font-medium text-zinc-500">Loading...</div>
    </div>
  )

  return isAuthenticated ? children : <Navigate to="/login" />
}

export default function App() {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const theme = { dark, toggle: () => setDark(d => !d) }

  return (
    <ThemeContext.Provider value={theme}>
      <BrowserRouter>
        <div className="relative min-h-screen bg-zinc-50 text-zinc-900 antialiased transition-colors duration-150 dark:bg-zinc-950 dark:text-zinc-100">

          <div className="pointer-events-none absolute inset-0 z-0">
            <DotField
              dotRadius={1.8}
              dotSpacing={15}
              cursorRadius={380}
              cursorForce={0.1}
              bulgeOnly
              bulgeStrength={55}
              sparkle={false}
              waveAmplitude={0}
              gradientFrom={dark ? 'rgba(161,161,170,0.55)' : 'rgba(24,24,27,0.55)'}
              gradientTo={dark ? 'rgba(113,113,122,0.35)' : 'rgba(24,24,27,0.30)'}
            />
          </div>

          <div className="relative z-10">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/*" element={
                // flex column + min-h-screen so Footer always pins to the true
                // bottom edge instead of leaving dead (dotted) space beneath it
                // on short-content pages.
                <div className="flex min-h-screen flex-col">
                  <Navbar />
                  <div className="flex-1">
                    <Routes>
                      <Route path="/" element={<Landing />} />
                      <Route path="/ask" element={<ProtectedRoute><Ask /></ProtectedRoute>} />
                      <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
                      <Route path="/evaluation" element={<Evaluation />} />
                    </Routes>
                  </div>
                  <Footer />
                </div>
              } />
            </Routes>
          </div>

        </div>
      </BrowserRouter>
    </ThemeContext.Provider>
  )
}
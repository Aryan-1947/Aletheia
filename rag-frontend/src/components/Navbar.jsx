import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, FileText, BarChart2, Zap, Sun, Moon, LogOut } from 'lucide-react'
import { useTheme } from '../App'
import { useAuth0 } from '@auth0/auth0-react'

const links = [
  { to: '/ask', label: 'Ask', icon: Search },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/evaluation', label: 'Evaluation', icon: BarChart2 },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const theme = useTheme()
  const { isAuthenticated, user, logout } = useAuth0()

  return (
    <nav style={{
      background: theme.navBg, borderBottom: `1px solid ${theme.border}`,
      backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50, transition: 'all 0.3s',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 10, padding: 8, display: 'flex' }}>
              <Zap size={18} color="white" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 18, color: theme.text }}>
              RAG<span style={{ color: '#6366f1' }}>Search</span>
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {links.map(({ to, label, icon: Icon }) => {
              const active = pathname === to
              return (
                <Link key={to} to={to} style={{ textDecoration: 'none' }}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 16px', borderRadius: 8,
                    background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                    border: active ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                    color: active ? '#818cf8' : theme.textSub,
                    fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                    <Icon size={15} />{label}
                  </motion.div>
                </Link>
              )
            })}

            {/* Theme Toggle */}
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={theme.toggle} style={{
                marginLeft: 8, padding: 8, borderRadius: 8,
                border: `1px solid ${theme.border}`, background: theme.bgCard,
                cursor: 'pointer', color: theme.textSub, display: 'flex', alignItems: 'center',
              }}>
              {theme.dark ? <Sun size={16} /> : <Moon size={16} />}
            </motion.button>

            {/* User Avatar + Logout */}
            {isAuthenticated && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
                <img
                  src={user.picture} alt={user.name}
                  style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #6366f1' }}
                />
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => logout({ 
  logoutParams: { 
    returnTo: window.location.origin + '/login'
  } 
})}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 8,
                    border: `1px solid ${theme.border}`, background: theme.bgCard,
                    color: theme.textMuted, cursor: 'pointer', fontSize: 13,
                  }}>
                  <LogOut size={14} /> Logout
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
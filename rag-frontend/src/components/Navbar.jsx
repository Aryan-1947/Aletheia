import { Link, useLocation } from 'react-router-dom'
import { Search, FileText, BarChart2, Sun, Moon, LogOut, Menu, X } from 'lucide-react'
import { useTheme } from '../App'
import { useAuth0 } from '@auth0/auth0-react'
import { useState } from 'react'

const links = [
  { to: '/ask', label: 'Ask', icon: Search },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/evaluation', label: 'Evaluation', icon: BarChart2 },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const { dark, toggle } = useTheme()
  const { isAuthenticated, user, logout } = useAuth0()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur-md transition-colors duration-150 dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex h-14 items-center justify-between">

            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 text-[14px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-900 dark:bg-white">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white dark:fill-zinc-900">
                  <path d="M12 2 L22 20 L17.5 20 L12 9.5 L6.5 20 L2 20 Z" />
                </svg>
              </span>
              Aletheia
            </Link>

            <div className="hidden items-center gap-1 sm:flex">
              {links.map(({ to, label, icon: Icon }) => {
                const active = pathname === to
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all duration-150 ${
                      active
                        ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100'
                        : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:hover:bg-zinc-900/60 dark:hover:text-zinc-200'
                    }`}
                  >
                    <Icon size={14} />
                    {label}
                  </Link>
                )
              })}

              <button
                onClick={toggle}
                className="ml-2 flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition-all duration-150 hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-100"
              >
                {dark ? <Sun size={14} /> : <Moon size={14} />}
              </button>

              {isAuthenticated && (
                <div className="ml-2 flex items-center gap-2">
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="h-8 w-8 rounded-full border border-zinc-200 dark:border-zinc-800"
                  />
                  <button
                    onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-[13px] font-medium text-zinc-600 transition-all duration-150 hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:text-zinc-100"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 sm:hidden">
              <button
                onClick={toggle}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400"
              >
                {dark ? <Sun size={14} /> : <Moon size={14} />}
              </button>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400"
              >
                {menuOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
            </div>

          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed left-0 right-0 top-14 z-40 border-b border-zinc-200 bg-white/95 px-6 py-3 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95">
          {links.map(({ to, label, icon: Icon }) => {
            const active = pathname === to
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium transition-all duration-150 ${
                  active
                    ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            )
          })}

          {isAuthenticated && (
            <div className="mt-2 border-t border-zinc-200 pt-3 dark:border-zinc-800">
              <div className="mb-2 flex items-center gap-3 px-3 py-1">
                <img src={user.picture} alt={user.name} className="h-8 w-8 rounded-full border border-zinc-200 dark:border-zinc-800" />
                <span className="text-[14px] font-medium text-zinc-900 dark:text-zinc-100">{user.name}</span>
              </div>
              <button
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                className="flex w-full items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2.5 text-[14px] text-zinc-600 dark:border-zinc-800 dark:text-zinc-400"
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
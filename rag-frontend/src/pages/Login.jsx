import { useAuth0 } from '@auth0/auth0-react'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { FaGoogle, FaGithub } from 'react-icons/fa'

export default function Login() {
  const { loginWithRedirect } = useAuth0()

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#0a0a0f', padding: 24,
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid #1e293b',
          borderRadius: 24, padding: '48px 40px',
          maxWidth: 420, width: '100%', textAlign: 'center',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 16, padding: 16, display: 'inline-flex' }}>
            <Zap size={32} color="white" />
          </div>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', marginBottom: 8 }}>
          Welcome to RAG<span style={{ color: '#6366f1' }}>Search</span>
        </h1>
        <p style={{ color: '#64748b', fontSize: 15, marginBottom: 40, lineHeight: 1.6 }}>
          Sign in to access your personal document space. Your documents are private and only visible to you.
        </p>

        {/* Login Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => loginWithRedirect({ authorizationParams: { connection: 'google-oauth2' } })}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              padding: '14px 24px', borderRadius: 12, border: '1px solid #334155',
              background: 'rgba(255,255,255,0.05)', color: '#f1f5f9',
              fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <FaGoogle size={18} color="#ea4335" /> Continue with Google
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => loginWithRedirect({ authorizationParams: { connection: 'github' } })}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              padding: '14px 24px', borderRadius: 12, border: '1px solid #334155',
              background: 'rgba(255,255,255,0.05)', color: '#f1f5f9',
              fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <FaGithub size={18} /> Continue with GitHub
          </motion.button>
        </div>

        <p style={{ color: '#334155', fontSize: 12, marginTop: 32, lineHeight: 1.6 }}>
          By signing in, your documents are stored privately. No other user can access your files or query your documents.
        </p>
      </motion.div>
    </div>
  )
}
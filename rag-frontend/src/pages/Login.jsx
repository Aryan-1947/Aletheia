import { useAuth0 } from '@auth0/auth0-react'
import { FaGoogle, FaGithub } from 'react-icons/fa'

export default function Login() {
  const { loginWithRedirect } = useAuth0()

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6 transition-colors duration-150 dark:bg-zinc-950">
      <div className="w-full max-w-[400px] rounded-xl border border-zinc-200 bg-white/70 p-10 text-center backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/40">

        <div className="mb-6 flex justify-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900 dark:bg-white">
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white dark:fill-zinc-900">
              <path d="M12 2 L22 20 L17.5 20 L12 9.5 L6.5 20 L2 20 Z" />
            </svg>
          </div>
        </div>

        <h1 className="mb-2 text-[22px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Welcome to Aletheia
        </h1>
        <p className="mb-8 text-[14px] leading-relaxed text-zinc-500">
          Sign in to access your personal document space. Your documents are private and only visible to you.
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => loginWithRedirect({ authorizationParams: { connection: 'google-oauth2' } })}
            className="flex items-center justify-center gap-2.5 rounded-lg border border-zinc-200 bg-white px-5 py-3 text-[14px] font-medium text-zinc-800 transition-all duration-150 hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
          >
            <FaGoogle size={15} /> Continue with Google
          </button>

          <button
            onClick={() => loginWithRedirect({ authorizationParams: { connection: 'github' } })}
            className="flex items-center justify-center gap-2.5 rounded-lg border border-zinc-200 bg-white px-5 py-3 text-[14px] font-medium text-zinc-800 transition-all duration-150 hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
          >
            <FaGithub size={15} /> Continue with GitHub
          </button>
        </div>

        <p className="mt-8 text-[12px] leading-relaxed text-zinc-400 dark:text-zinc-600">
          By signing in, your documents are stored privately. No other user can access your files or query your documents.
        </p>
      </div>
    </div>
  )
}
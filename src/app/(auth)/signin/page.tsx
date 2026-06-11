'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function SignInContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/feed'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleSubmit() {
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid email or password.')
      setLoading(false)
    } else {
      router.push(callbackUrl)
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    await signIn('google', { callbackUrl: '/feed' })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>

      <nav style={{ borderBottom: '2px solid #1a1a1a', padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="12" stroke="#F43F5E" strokeWidth="2"/>
            <ellipse cx="14" cy="14" rx="5" ry="12" stroke="#F43F5E" strokeWidth="1.5"/>
            <line x1="2" y1="14" x2="26" y2="14" stroke="#F43F5E" strokeWidth="1.5"/>
            <line x1="4" y1="8" x2="24" y2="8" stroke="#F43F5E" strokeWidth="1"/>
            <line x1="4" y1="20" x2="24" y2="20" stroke="#F43F5E" strokeWidth="1"/>
          </svg>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC', letterSpacing: '0.02em' }}>Simple Economics</span>
        </Link>
        <Link href="/signup" style={{ fontSize: '12px', color: '#94A3B8', textDecoration: 'none' }}>
          No account? Sign up →
        </Link>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'inline-block', background: '#E63329', padding: '4px 10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#fff', fontFamily: 'Unbounded, sans-serif' }}>
                Sign In
              </span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#F8FAFC', lineHeight: 1.1, marginBottom: '8px', fontFamily: 'Unbounded, sans-serif', letterSpacing: '-0.02em' }}>
              Welcome back.
            </h1>
            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6 }}>
              The economy, translated for your life.
            </p>
          </div>

          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            style={{ width: '100%', background: '#111', border: '2px solid #1E293B', color: '#F8FAFC', fontSize: '13px', fontWeight: 600, padding: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {googleLoading ? 'Redirecting...' : 'Continue with Google'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: '#1E293B' }} />
            <span style={{ fontSize: '11px', color: '#334155' }}>or sign in with email</span>
            <div style={{ flex: 1, height: '1px', background: '#1E293B' }} />
          </div>

          {error && (
            <div style={{ background: '#1a0505', border: '2px solid #E63329', padding: '12px 16px', marginBottom: '20px' }}>
              <p style={{ fontSize: '13px', color: '#E63329', margin: 0 }}>{error}</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#64748B', marginBottom: '6px' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={function(e) { setEmail(e.target.value) }}
                onKeyDown={function(e) { if (e.key === 'Enter') handleSubmit() }}
                placeholder="you@example.com"
                style={{ width: '100%', background: '#111', border: '2px solid #1E293B', color: '#F8FAFC', fontSize: '14px', padding: '12px 14px', outline: 'none', boxSizing: 'border-box' as const }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#64748B', marginBottom: '6px' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={function(e) { setPassword(e.target.value) }}
                onKeyDown={function(e) { if (e.key === 'Enter') handleSubmit() }}
                placeholder="••••••••"
                style={{ width: '100%', background: '#111', border: '2px solid #1E293B', color: '#F8FAFC', fontSize: '14px', padding: '12px 14px', outline: 'none', boxSizing: 'border-box' as const }}
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: '100%', background: loading ? '#333' : '#E63329', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, padding: '14px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Unbounded, sans-serif', marginBottom: '20px' }}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>

          <p style={{ textAlign: 'center' as const, fontSize: '13px', color: '#475569' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={{ color: '#F43F5E', textDecoration: 'none', fontWeight: 600 }}>
              Create one free →
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0A0A0A' }} />}>
      <SignInContent />
    </Suspense>
  )
}

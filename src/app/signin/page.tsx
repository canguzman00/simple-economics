'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
      router.push('/feed')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>

      {/* NAV */}
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

      {/* FORM */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* HEADER */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'inline-block', background: '#E63329', padding: '4px 10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#fff', fontFamily: 'Unbounded, sans-serif' }}>
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

          {/* ERROR */}
          {error && (
            <div style={{ background: '#1a0505', border: '2px solid #E63329', padding: '12px 16px', marginBottom: '20px' }}>
              <p style={{ fontSize: '13px', color: '#E63329', margin: 0 }}>{error}</p>
            </div>
          )}

          {/* FIELDS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748B', marginBottom: '6px' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={function(e) { setEmail(e.target.value) }}
                onKeyDown={function(e) { if (e.key === 'Enter') handleSubmit() }}
                placeholder="you@example.com"
                style={{ width: '100%', background: '#111', border: '2px solid #1E293B', color: '#F8FAFC', fontSize: '14px', padding: '12px 14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#64748B', marginBottom: '6px' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={function(e) { setPassword(e.target.value) }}
                onKeyDown={function(e) { if (e.key === 'Enter') handleSubmit() }}
                placeholder="••••••••"
                style={{ width: '100%', background: '#111', border: '2px solid #1E293B', color: '#F8FAFC', fontSize: '14px', padding: '12px 14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* SUBMIT */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: '100%', background: loading ? '#333' : '#E63329', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '14px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Unbounded, sans-serif', marginBottom: '20px' }}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>

          {/* DIVIDER */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: '#1E293B' }} />
            <span style={{ fontSize: '11px', color: '#334155' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: '#1E293B' }} />
          </div>

          {/* SIGNUP LINK */}
          <p style={{ textAlign: 'center', fontSize: '13px', color: '#475569' }}>
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

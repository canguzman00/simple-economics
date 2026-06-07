'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!email || !password) {
      setError('Please fill in all required fields.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong.')
        setLoading(false)
        return
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        router.push('/signin')
      } else {
        router.push('/onboarding')
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
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
        <Link href="/signin" style={{ fontSize: '12px', color: '#94A3B8', textDecoration: 'none' }}>
          Already have an account? Sign in →
        </Link>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'inline-block', background: '#1B4FD8', padding: '4px 10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#fff', fontFamily: 'Unbounded, sans-serif' }}>
                Create Account
              </span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#F8FAFC', lineHeight: 1.1, marginBottom: '8px', fontFamily: 'Unbounded, sans-serif', letterSpacing: '-0.02em' }}>
              Start understanding<br />your economy.
            </h1>
            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6 }}>
              Free to join. No credit card required.
            </p>
          </div>

          {error && (
            <div style={{ background: '#1a0505', border: '2px solid #E63329', padding: '12px 16px', marginBottom: '20px' }}>
              <p style={{ fontSize: '13px', color: '#E63329', margin: 0 }}>{error}</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '12px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#64748B', marginBottom: '6px' }}>
                Name <span style={{ color: '#334155' }}>(optional)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={function(e) { setName(e.target.value) }}
                placeholder="Your name"
                style={{ width: '100%', background: '#111', border: '2px solid #1E293B', color: '#F8FAFC', fontSize: '14px', padding: '12px 14px', outline: 'none', boxSizing: 'border-box' as const }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#64748B', marginBottom: '6px' }}>
                Email <span style={{ color: '#E63329' }}>*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={function(e) { setEmail(e.target.value) }}
                placeholder="you@example.com"
                style={{ width: '100%', background: '#111', border: '2px solid #1E293B', color: '#F8FAFC', fontSize: '14px', padding: '12px 14px', outline: 'none', boxSizing: 'border-box' as const }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#64748B', marginBottom: '6px' }}>
                Password <span style={{ color: '#E63329' }}>*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={function(e) { setPassword(e.target.value) }}
                placeholder="Minimum 8 characters"
                style={{ width: '100%', background: '#111', border: '2px solid #1E293B', color: '#F8FAFC', fontSize: '14px', padding: '12px 14px', outline: 'none', boxSizing: 'border-box' as const }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#64748B', marginBottom: '6px' }}>
                Confirm Password <span style={{ color: '#E63329' }}>*</span>
              </label>
              <input
                type="password"
                value={confirm}
                onChange={function(e) { setConfirm(e.target.value) }}
                onKeyDown={function(e) { if (e.key === 'Enter') handleSubmit() }}
                placeholder="Repeat your password"
                style={{ width: '100%', background: '#111', border: '2px solid #1E293B', color: '#F8FAFC', fontSize: '14px', padding: '12px 14px', outline: 'none', boxSizing: 'border-box' as const }}
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: '100%', background: loading ? '#333' : '#1B4FD8', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, padding: '14px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Unbounded, sans-serif', marginBottom: '20px' }}>
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>

          <p style={{ textAlign: 'center' as const, fontSize: '13px', color: '#475569' }}>
            Already have an account?{' '}
            <Link href="/signin" style={{ color: '#F43F5E', textDecoration: 'none', fontWeight: 600 }}>
              Sign in →
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}

import Link from 'next/link'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav style={{ background: '#1E293B', borderBottom: '1px solid #334155', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem', height: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="14" cy="14" r="12" stroke="#F43F5E" strokeWidth="2"/>
              <ellipse cx="14" cy="14" rx="5" ry="12" stroke="#F43F5E" strokeWidth="1.5"/>
              <line x1="2" y1="14" x2="26" y2="14" stroke="#F43F5E" strokeWidth="1.5"/>
              <line x1="4" y1="8" x2="24" y2="8" stroke="#F43F5E" strokeWidth="1"/>
              <line x1="4" y1="20" x2="24" y2="20" stroke="#F43F5E" strokeWidth="1"/>
            </svg>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC', letterSpacing: '0.02em' }}>Simple Economics</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {[
              { label: 'Feed', href: '/feed' },
              { label: 'Ask', href: '/ask' },
              { label: 'My Economy', href: '/my-economy' },
              { label: 'Companies', href: '/company/AAPL' },
            ].map(function(item) {
              return (
                <Link key={item.href} href={item.href}
                  style={{ fontSize: '12px', color: '#94A3B8', textDecoration: 'none', padding: '6px 12px', borderRadius: '6px' }}>
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
      {children}
    </>
  )
}

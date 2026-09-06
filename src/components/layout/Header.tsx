"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NAV_LINKS = [
  { label: "My Economist",      href: "/my-economist" },
];

function NavLink({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      onClick={onClick}
      className="relative text-xs font-medium tracking-wide transition-colors"
      style={{
        color: isActive ? "#F43F5E" : "#94A3B8",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {label}
      {isActive && (
        <span className="absolute -bottom-0.5 left-0 right-0 h-0.5" style={{ background: "#F43F5E" }} />
      )}
    </Link>
  );
}

function ProfileButton() {
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const complete = localStorage.getItem("se_onboarding_complete");
    setHasProfile(!!complete);
  }, []);

  if (!hasProfile) return null;

  return (
    <Link
      href="/profile"
      className="text-xs font-semibold tracking-wide px-4 py-2 rounded-lg transition-colors"
      style={{
        background: "#334155",
        color: "#F8FAFC",
        fontFamily: "Inter, sans-serif",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "#F43F5E")}
      onMouseLeave={e => (e.currentTarget.style.background = "#334155")}
    >
      My Profile
    </Link>
  );
}

export function Header() {
  return (
    <header
      className="sticky top-0 z-40"
      style={{ background: "#1E293B", borderBottom: "1px solid #334155" }}
    >
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <circle cx="14" cy="14" r="12" stroke="#F43F5E" strokeWidth="2"/>
            <ellipse cx="14" cy="14" rx="5" ry="12" stroke="#F43F5E" strokeWidth="1.5"/>
            <line x1="2" y1="14" x2="26" y2="14" stroke="#F43F5E" strokeWidth="1.5"/>
            <line x1="4" y1="8" x2="24" y2="8" stroke="#F43F5E" strokeWidth="1"/>
            <line x1="4" y1="20" x2="24" y2="20" stroke="#F43F5E" strokeWidth="1"/>
          </svg>
          <span
            className="text-sm font-bold tracking-wide leading-none"
            style={{ color: "#F8FAFC", fontFamily: "Inter, sans-serif" }}
          >
            Simple Economics
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-3">
          <ProfileButton />
        </div>

        {/* Mobile hamburger */}
        <Sheet>
          <SheetTrigger asChild>
            <button
              className="md:hidden transition-colors"
              style={{ color: "#94A3B8" }}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </SheetTrigger>
          <SheetContent
            className="p-0 border-l"
            style={{ background: "#1E293B", borderColor: "#334155" }}
          >
            <div className="flex flex-col h-full pt-14 px-6 pb-8">
              <div className="flex items-center gap-2.5 mb-10">
                <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                  <circle cx="14" cy="14" r="12" stroke="#F43F5E" strokeWidth="2"/>
                  <ellipse cx="14" cy="14" rx="5" ry="12" stroke="#F43F5E" strokeWidth="1.5"/>
                  <line x1="2" y1="14" x2="26" y2="14" stroke="#F43F5E" strokeWidth="1.5"/>
                  <line x1="4" y1="8" x2="24" y2="8" stroke="#F43F5E" strokeWidth="1"/>
                  <line x1="4" y1="20" x2="24" y2="20" stroke="#F43F5E" strokeWidth="1"/>
                </svg>
                <span
                  className="text-sm font-bold tracking-wide"
                  style={{ color: "#F8FAFC", fontFamily: "Inter, sans-serif" }}
                >
                  Simple Economics
                </span>
              </div>
              <nav className="flex flex-col gap-6">
                {NAV_LINKS.map((link) => (
                  <NavLink key={link.href} {...link} />
                ))}
              </nav>
              <div className="mt-auto">
                <ProfileButton />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

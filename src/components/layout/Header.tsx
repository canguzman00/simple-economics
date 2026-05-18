"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { Menu } from "lucide-react";
import { useSession } from "@/lib/auth";
import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useLang } from "@/contexts/LanguageContext";
import { useTranslations } from "@/lib/translations";

function useNavLinks() {
  const { lang } = useLang();
  const tr = useTranslations(lang);
  return [
    { label: tr.nav.feed,      href: "/feed" },
    { label: tr.nav.ask,       href: "/ask" },
    { label: tr.nav.myEconomy, href: "/my-economy" },
    { label: "My Impact",      href: "/calculator" },
    { label: tr.nav.saved,     href: "/saved" },
  ];
}

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

function LangToggle() {
  const { lang, toggleLang } = useLang();
  return (
    <button
      onClick={toggleLang}
      className="text-[10px] font-semibold uppercase tracking-widest transition-colors px-2 py-1 rounded"
      style={{
        color: "#94A3B8",
        border: "1px solid #334155",
        fontFamily: "Inter, sans-serif",
        background: "transparent",
      }}
    >
      {lang === "en" ? "ES" : "EN"}
    </button>
  );
}

function AvatarMenu({ session }: { session: NonNullable<ReturnType<typeof useSession>["data"]> }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { lang } = useLang();
  const tr = useTranslations(lang);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)} aria-label="Account menu">
        <Avatar className="w-8 h-8 rounded-full" style={{ outline: "2px solid #334155" }}>
          <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? "User"} />
          <AvatarFallback
            className="rounded-full text-xs font-semibold"
            style={{ background: "#334155", color: "#F8FAFC", fontFamily: "Inter, sans-serif" }}
          >
            {(session.user.name ?? session.user.email ?? "U").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </button>
      {open && (
        <div
          className="absolute right-0 top-10 w-48 z-50 rounded-lg overflow-hidden"
          style={{ background: "#1E293B", border: "1px solid #334155", boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}
        >
          <div className="px-3 py-2" style={{ borderBottom: "1px solid #334155" }}>
            <p className="text-xs truncate" style={{ color: "#64748B", fontFamily: "Inter, sans-serif" }}>
              {session.user.email}
            </p>
          </div>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center px-3 py-2.5 text-xs font-medium transition-colors"
            style={{ color: "#F8FAFC", fontFamily: "Inter, sans-serif" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#F43F5E")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            {tr.auth.editProfile}
          </Link>
          <button
            onClick={() => signOut()}
            className="w-full text-left flex items-center px-3 py-2.5 text-xs font-medium transition-colors"
            style={{ color: "#64748B", fontFamily: "Inter, sans-serif" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#F8FAFC")}
            onMouseLeave={e => (e.currentTarget.style.color = "#64748B")}
          >
            {tr.auth.signOut}
          </button>
        </div>
      )}
    </div>
  );
}

function AuthControl() {
  const { data: session, status } = useSession();
  const { lang } = useLang();
  const tr = useTranslations(lang);

  if (status === "loading") return <div className="h-8 w-16 rounded animate-pulse" style={{ background: "#334155" }} />;

  if (session?.user) return <AvatarMenu session={session} />;

  return (
    <button
      onClick={() => signIn()}
      className="text-xs font-semibold tracking-wide px-4 py-2 rounded-lg transition-colors"
      style={{
        background: "#F43F5E",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "#E11D48")}
      onMouseLeave={e => (e.currentTarget.style.background = "#F43F5E")}
    >
      {tr.auth.signIn}
    </button>
  );
}

export function Header() {
  const NAV_LINKS = useNavLinks();
  return (
    <header
      className="sticky top-0 z-40"
      style={{ background: "#1E293B", borderBottom: "1px solid #334155" }}
    >
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-6 h-6 rounded-md flex-shrink-0" style={{ background: "#F43F5E" }} />
          <span
            className="text-sm font-bold tracking-wide leading-none"
            style={{ color: "#F8FAFC", fontFamily: "Inter, sans-serif" }}
          >
            Simple Economics
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3">
            <LangToggle />
            <AuthControl />
          </div>
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
                  <div className="w-6 h-6 rounded-md flex-shrink-0" style={{ background: "#F43F5E" }} />
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
                <div className="mt-auto flex flex-col gap-4">
                  <LangToggle />
                  <AuthControl />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

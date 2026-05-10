"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { Menu } from "lucide-react";
import { useSession } from "@/lib/auth";
import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const NAV_LINKS = [
  { label: "Feed",             href: "/feed" },
  { label: "Ask the Economist", href: "/ask" },
  { label: "My Economy",       href: "/my-economy" },
  { label: "Saved",            href: "/saved" },
];

function NavLink({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative font-sans text-xs uppercase tracking-widest transition-colors ${
        isActive ? "text-primary-red" : "text-primary-black hover:text-primary-red"
      }`}
    >
      {label}
      {isActive && (
        <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-primary-red" />
      )}
    </Link>
  );
}

function AvatarMenu({ session }: { session: NonNullable<ReturnType<typeof useSession>["data"]> }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
        <Avatar className="rounded-none w-8 h-8">
          <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? "User"} />
          <AvatarFallback className="rounded-none bg-primary-black text-primary-white font-display text-xs">
            {(session.user.name ?? session.user.email ?? "U").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-48 bg-primary-white border-2 border-primary-black shadow-[4px_4px_0px_#0A0A0A] z-50">
          <div className="px-3 py-2 border-b-2 border-primary-black">
            <p className="font-sans text-xs text-gray-500 truncate">
              {session.user.email}
            </p>
          </div>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center px-3 py-2.5 font-sans text-xs uppercase tracking-wider text-primary-black hover:bg-primary-red hover:text-primary-white transition-colors"
          >
            Edit Profile
          </Link>
          <button
            onClick={() => signOut()}
            className="w-full text-left flex items-center px-3 py-2.5 font-sans text-xs uppercase tracking-wider text-gray-500 hover:bg-gray-100 hover:text-primary-black transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function AuthControl() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-8 w-16 bg-gray-200 animate-pulse" />;
  }

  if (session?.user) {
    return <AvatarMenu session={session} />;
  }

  return (
    <button
      onClick={() => signIn()}
      className="font-sans text-xs uppercase tracking-widest bg-primary-black text-primary-white hover:bg-primary-red transition-colors px-4 py-2"
    >
      Sign in
    </button>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-primary-white border-b-2 border-primary-black">
      <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="w-3 h-3 bg-primary-red shrink-0" aria-hidden="true" />
          <span className="font-display text-sm font-bold uppercase tracking-widest text-primary-black leading-none">
            Simple Economics
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>

        {/* Auth + mobile trigger */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <AuthControl />
          </div>

          {/* Mobile hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                className="md:hidden text-primary-black hover:text-primary-red transition-colors"
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>
            </SheetTrigger>
            <SheetContent className="bg-primary-white border-l-2 border-primary-black p-0">
              <div className="flex flex-col h-full pt-14 px-6 pb-8">
                {/* Mobile logo */}
                <div className="flex items-center gap-2.5 mb-10">
                  <span className="w-3 h-3 bg-primary-red shrink-0" aria-hidden="true" />
                  <span className="font-display text-sm font-bold uppercase tracking-widest text-primary-black">
                    Simple Economics
                  </span>
                </div>

                {/* Mobile nav */}
                <nav className="flex flex-col gap-6">
                  {NAV_LINKS.map((link) => (
                    <NavLink key={link.href} {...link} />
                  ))}
                </nav>

                <div className="mt-auto">
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

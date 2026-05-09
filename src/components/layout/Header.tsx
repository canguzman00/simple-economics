"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import { Menu } from "lucide-react";
import { useSession } from "@/lib/auth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const NAV_LINKS = [
  { label: "Feed", href: "/feed" },
  { label: "Ask Carlos", href: "/ask" },
  { label: "My Economy", href: "/my-economy" },
  { label: "Saved", href: "/saved" },
];

function NavLink({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`relative font-sans text-sm transition-colors pb-0.5 ${
        isActive ? "text-[#C49A52]" : "text-[#C8B8A2] hover:text-[#E2C27A]"
      }`}
    >
      {label}
      {isActive && (
        <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-[#C49A52]" />
      )}
    </Link>
  );
}

function AuthControl() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-8 w-8 rounded-full bg-[#2C2417] animate-pulse" />;
  }

  if (session?.user) {
    return (
      <button onClick={() => signOut()} className="group relative" title="Sign out">
        <Avatar>
          <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? "User"} />
          <AvatarFallback>
            {(session.user.name ?? session.user.email ?? "U").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="absolute -bottom-6 right-0 text-[10px] text-[#4A3D2A] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-sans">
          Sign out
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn()}
      className="font-sans text-sm text-[#C49A52] hover:text-[#E2C27A] transition-colors border border-[#4A3D2A] hover:border-[#C49A52] px-3 py-1.5 rounded"
    >
      Sign in
    </button>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-[#1A1208]/95 backdrop-blur-sm border-b border-[#2C2417]">
      <div className="mx-auto max-w-4xl px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-serif text-xl text-[#C49A52] tracking-tight leading-none shrink-0">
          Simple Economics
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
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
                className="md:hidden text-[#7A6A52] hover:text-[#C8B8A2] transition-colors"
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col h-full pt-12 px-6 pb-8">
                <span className="font-serif text-lg text-[#C49A52] mb-8">
                  Simple Economics
                </span>
                <nav className="flex flex-col gap-5">
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

import Link from "next/link";
import { getAuthSession } from "@/lib/auth";

// Server component: checks the session itself so every page that renders
// this footer (homepage, My Economist, profile) gets the right links
// without threading auth state through each layout.
export async function Footer() {
  const session = await getAuthSession();
  const isAuthenticated = !!session?.user;

  const links = [
    { label: "My Economist", href: "/my-economist" },
    ...(isAuthenticated ? [] : [{ label: "Sign in", href: "/signin" }]),
  ];

  return (
    <footer className="border-t-2 border-primary-black bg-primary-white mt-auto">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 bg-primary-red shrink-0" aria-hidden="true" />
            <span className="font-sans text-sm font-bold uppercase tracking-widest text-primary-black">
              Simple Economics
            </span>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {links.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="font-sans text-xs uppercase tracking-wider text-gray-500 hover:text-primary-red transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-primary-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="font-sans text-[10px] uppercase tracking-wider text-gray-300">
            © {new Date().getFullYear()} Simple Economics
          </p>
          <p className="font-sans text-[10px] text-gray-400 max-w-md sm:text-center">
            Evidence you can inspect. Choices that stay yours.
          </p>
          <p className="font-sans text-[10px] text-gray-300 max-w-xs sm:text-right">
            Economic education only. Not financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}

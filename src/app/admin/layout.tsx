import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession();

  if (!session?.user) redirect("/signin");
  if (session.user.email !== process.env.ADMIN_EMAIL) redirect("/feed");

  return (
    <div className="min-h-screen bg-[#1A1208]">
      {/* Admin nav bar */}
      <nav className="sticky top-0 z-40 bg-[#1A1208]/95 backdrop-blur-sm border-b border-[#2C2417]">
        <div className="mx-auto max-w-5xl px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-serif text-base text-[#C49A52] leading-none">
              SE Admin
            </span>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/events"
                className="font-sans text-xs text-[#7A6A52] hover:text-[#C8B8A2] transition-colors"
              >
                Events
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-sans text-xs text-[#4A3D2A]">{session.user.email}</span>
            <Link
              href="/feed"
              className="font-sans text-xs text-[#7A6A52] hover:text-[#C49A52] transition-colors"
            >
              ← Back to site
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {children}
      </main>
    </div>
  );
}

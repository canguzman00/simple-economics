export const dynamic = "force-dynamic";

import Link from "next/link";

export default function FeedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="font-serif text-5xl sm:text-6xl text-[#C49A52]">Coming Soon</h1>
      <p className="mt-5 font-sans text-base text-[#7A6A52] max-w-sm leading-relaxed">
        The Translator Feed is being built. Check back soon.
      </p>
      <Link
        href="/onboarding"
        className="mt-10 font-sans text-sm text-[#C49A52] hover:text-[#E2C27A] border border-[#4A3D2A] hover:border-[#C49A52] transition-colors px-5 py-2.5 rounded-lg"
      >
        Retake the quiz
      </Link>
    </div>
  );
}

"use client";

export function OptionCard({
  emoji,
  label,
  sub,
  selected,
  onClick,
}: {
  emoji: string;
  label: string;
  sub: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-lg border text-left transition-all duration-150 ${
        selected
          ? "border-[#C49A52] bg-[#C49A52]/10"
          : "border-[#2C2417] bg-[#2C2417]/40 hover:border-[#4A3D2A]"
      }`}
    >
      <span className="text-2xl leading-none select-none">{emoji}</span>
      <div className="min-w-0">
        <p className={`font-sans text-sm font-medium ${selected ? "text-[#C49A52]" : "text-[#C8B8A2]"}`}>
          {label}
        </p>
        <p className="font-sans text-xs text-[#7A6A52] mt-0.5">{sub}</p>
      </div>
      {selected && (
        <span className="ml-auto shrink-0 text-[#C49A52]">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="7.5" stroke="currentColor" />
            <path d="M4.5 8l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
    </button>
  );
}

function CardSkeleton() {
  return (
    <div className="flex flex-col gap-4 bg-[#2C2417]/40 border border-[#2C2417] rounded-xl px-6 py-6 animate-pulse">
      {/* Badge row */}
      <div className="flex items-center gap-2">
        <div className="h-5 w-28 rounded-full bg-[#2C2417]" />
        <div className="h-4 w-20 rounded bg-[#2C2417]" />
        <div className="ml-auto h-4 w-16 rounded bg-[#2C2417]" />
      </div>
      {/* Title */}
      <div className="space-y-2">
        <div className="h-7 w-4/5 rounded bg-[#2C2417]" />
        <div className="h-7 w-2/3 rounded bg-[#2C2417]" />
      </div>
      {/* Summary */}
      <div className="space-y-1.5">
        <div className="h-4 w-full rounded bg-[#2C2417]" />
        <div className="h-4 w-full rounded bg-[#2C2417]" />
        <div className="h-4 w-3/4 rounded bg-[#2C2417]" />
      </div>
      {/* Callout */}
      <div className="border-l-2 border-[#2C2417] pl-4 space-y-2">
        <div className="h-3 w-32 rounded bg-[#2C2417]" />
        <div className="h-4 w-full rounded bg-[#2C2417]" />
        <div className="h-4 w-5/6 rounded bg-[#2C2417]" />
      </div>
    </div>
  );
}

export default function FeedLoading() {
  return (
    <div>
      {/* Filter bar skeleton */}
      <div className="flex gap-2 mb-4">
        {[80, 120, 140, 130, 110].map((w, i) => (
          <div key={i} className="h-7 rounded-full bg-[#2C2417] animate-pulse" style={{ width: w }} />
        ))}
      </div>
      <div className="flex gap-2 mb-8">
        <div className="h-4 w-12 rounded bg-[#2C2417] animate-pulse" />
        {[48, 56, 64, 40].map((w, i) => (
          <div key={i} className="h-6 rounded bg-[#2C2417] animate-pulse" style={{ width: w }} />
        ))}
      </div>
      {/* Card skeletons */}
      <div className="flex flex-col gap-5">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}

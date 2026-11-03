export default function RootLoading() {
  return (
    <div className="min-h-screen text-white pt-28 sm:pt-36 pb-20 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 w-full max-w-[1920px] mx-auto space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <div className="w-36 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20" />
        <div className="w-72 sm:w-96 h-10 sm:h-12 rounded-2xl bg-neutral-800/80" />
        <div className="w-full max-w-2xl h-4 rounded-lg bg-neutral-800/60" />
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 pt-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="p-5 sm:p-6 rounded-3xl bg-neutral-900/60 border border-white/5 space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <div className="w-24 h-4 rounded-md bg-neutral-800/80" />
              <div className="w-16 h-4 rounded-full bg-neutral-800/80" />
            </div>

            <div className="grid grid-cols-12 items-center gap-2 py-3">
              <div className="col-span-4 flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-neutral-800/80" />
                <div className="w-16 h-3 rounded bg-neutral-800/60" />
              </div>
              <div className="col-span-4 flex flex-col items-center gap-1">
                <div className="w-16 h-8 rounded-xl bg-neutral-800/80" />
                <div className="w-12 h-2.5 rounded bg-neutral-800/40" />
              </div>
              <div className="col-span-4 flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-neutral-800/80" />
                <div className="w-16 h-3 rounded bg-neutral-800/60" />
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex justify-between items-center">
              <div className="w-20 h-4 rounded bg-neutral-800/60" />
              <div className="w-24 h-7 rounded-xl bg-neutral-800/80" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


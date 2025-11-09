import { CardSkeleton } from "@/components/ui/CardSkeleton";

export default function Loading() {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-indigo-50 min-h-screen pt-7 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="flex justify-between items-center mb-6 animate-pulse">
          <div>
            <div className="h-8 w-56 bg-blue-200/60 rounded" />
            <div className="h-4 w-80 bg-blue-200/50 rounded mt-2" />
          </div>
          <div className="h-10 w-40 bg-blue-300/60 rounded" />
        </div>

        {/* Search skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 animate-pulse">
          <div className="rounded-xl md:col-span-6 h-12 bg-white/70 shadow-md" />
        </div>

        {/* Cards grid skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

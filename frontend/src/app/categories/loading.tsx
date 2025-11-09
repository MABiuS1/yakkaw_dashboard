import { RowSkeleton } from "@/components/ui/RowSkeleton";

export default function Loading() {
  return (
    <div className="bg-gradient-to-b from-emerald-50 to-green-50 min-h-screen pt-7 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="flex justify-between items-center mb-6">
          <div className="animate-pulse">
            <div className="h-8 w-56 bg-emerald-200/60 rounded" />
            <div className="h-4 w-80 bg-emerald-200/50 rounded mt-2" />
          </div>
          <div className="h-10 w-40 bg-emerald-300/60 rounded animate-pulse" />
        </div>

        {/* Search skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
          <div className="rounded-xl md:col-span-6 h-12 bg-white/70 shadow-md animate-pulse" />
        </div>

        {/* List container */}
        <div className="bg-white rounded-lg border border-emerald-100 shadow-sm overflow-hidden">
          {/* Header row */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 py-3 bg-emerald-600 border-b border-emerald-100 text-white text-sm">
            <div className="md:col-span-8">Name</div>
            <div className="md:col-span-2">ID</div>
            <div className="md:col-span-2 text-right">Actions</div>
          </div>

          {/* Skeleton rows */}
          <ul className="divide-y divide-emerald-100">
            {Array.from({ length: 8 }).map((_, i) => (
              <RowSkeleton key={i} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

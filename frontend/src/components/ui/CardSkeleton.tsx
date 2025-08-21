export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-blue-100 p-5 animate-pulse">
      <div className="h-5 w-2/3 bg-blue-200/60 rounded mb-3" />
      <div className="h-4 w-1/2 bg-blue-200/50 rounded mb-5" />
      <div className="space-y-2">
        <div className="h-3 w-full bg-blue-100 rounded" />
        <div className="h-3 w-5/6 bg-blue-100 rounded" />
        <div className="h-3 w-2/3 bg-blue-100 rounded" />
      </div>
      <div className="mt-5 flex gap-2">
        <div className="h-9 w-20 bg-blue-200/60 rounded" />
        <div className="h-9 w-20 bg-blue-200/40 rounded" />
      </div>
    </div>
  );
}
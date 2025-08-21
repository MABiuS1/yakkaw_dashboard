export const RowSkeleton = () => {
  return (
    <li className="grid grid-cols-12 gap-4 px-4 py-3 items-center animate-pulse">
      {/* Name */}
      <div className="col-span-8 h-5 bg-emerald-200/60 rounded" />
      {/* ID */}
      <div className="col-span-2 h-5 bg-emerald-200/50 rounded" />
      {/* Actions */}
      <div className="col-span-2 flex justify-end gap-2">
        <div className="h-8 w-16 bg-emerald-200/60 rounded" />
        <div className="h-8 w-16 bg-emerald-200/40 rounded" />
      </div>
    </li>
  );
};

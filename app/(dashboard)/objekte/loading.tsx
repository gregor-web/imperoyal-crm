function SkeletonCard() {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Mandant Header */}
      <div className="bg-gradient-to-r from-[#1E2A3A] to-[#2A3F54] px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/10 rounded-lg" />
          <div className="space-y-2">
            <div className="h-5 w-32 bg-white/20 rounded" />
            <div className="h-3 w-20 bg-white/10 rounded" />
          </div>
        </div>
      </div>
      {/* Table Rows */}
      <div className="p-4 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-4 flex-1 bg-[#EDF1F5] rounded" />
            <div className="h-4 w-20 bg-[#EDF1F5] rounded" />
            <div className="h-4 w-24 bg-[#EDF1F5] rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="h-7 w-28 bg-[#EDF1F5] rounded-lg" />
          <div className="h-4 w-56 bg-[#EDF1F5] rounded mt-2" />
        </div>
        <div className="h-10 w-36 bg-[#EDF1F5] rounded-lg" />
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="h-11 flex-1 bg-[#EDF1F5] rounded-lg" />
        <div className="h-11 w-40 bg-[#EDF1F5] rounded-lg" />
      </div>

      {/* Grouped Cards */}
      {[...Array(3)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="h-7 w-48 bg-[#EDF1F5] rounded-lg" />
          <div className="h-4 w-64 bg-[#EDF1F5] rounded mt-2" />
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#EDF1F5] rounded-lg" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-20 bg-[#EDF1F5] rounded" />
                <div className="h-6 w-16 bg-[#EDF1F5] rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <div className="glass-card rounded-xl p-4 sm:p-6">
        <div className="h-5 w-32 bg-[#EDF1F5] rounded mb-4" />
        <div className="flex gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 w-44 bg-[#EDF1F5] rounded-lg" />
          ))}
        </div>
      </div>

      {/* Activity Skeleton */}
      <div className="glass-card rounded-xl p-4 sm:p-6">
        <div className="h-5 w-40 bg-[#EDF1F5] rounded mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3">
              <div className="space-y-2">
                <div className="h-4 w-48 bg-[#EDF1F5] rounded" />
                <div className="h-3 w-32 bg-[#EDF1F5] rounded" />
              </div>
              <div className="h-6 w-24 bg-[#EDF1F5] rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

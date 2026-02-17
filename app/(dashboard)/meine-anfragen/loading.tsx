export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="h-7 w-44 bg-[#162636] rounded-lg" />
          <div className="h-4 w-56 bg-[#162636] rounded mt-2" />
        </div>
        <div className="h-10 w-36 bg-[#162636] rounded-lg" />
      </div>

      {/* Status Legend */}
      <div className="glass-card rounded-xl p-4 sm:p-6">
        <div className="flex flex-wrap gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-6 w-32 bg-[#162636] rounded-full" />
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 bg-[#162636] rounded-lg shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-48 bg-[#162636] rounded" />
                  <div className="h-3 w-36 bg-[#162636] rounded" />
                  <div className="h-3 w-28 bg-[#162636] rounded" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-6 w-24 bg-[#162636] rounded-full" />
                <div className="h-8 w-8 bg-[#162636] rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

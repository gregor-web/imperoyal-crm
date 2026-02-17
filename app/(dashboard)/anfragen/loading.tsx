export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div>
        <div className="h-7 w-56 bg-[#162636] rounded-lg" />
        <div className="h-4 w-64 bg-[#162636] rounded mt-2" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-card rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#162636] rounded-lg" />
              <div className="space-y-2">
                <div className="h-3 w-24 bg-[#162636] rounded" />
                <div className="h-6 w-10 bg-[#162636] rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl p-4 sm:p-6">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3">
              <div className="h-4 flex-1 bg-[#162636] rounded" />
              <div className="h-4 w-24 bg-[#162636] rounded" />
              <div className="h-4 w-20 bg-[#162636] rounded" />
              <div className="h-8 w-16 bg-[#162636] rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {[...Array(cols)].map((_, i) => (
        <td key={i} className="px-3 py-3 sm:px-4 sm:py-4">
          <div className="h-4 bg-[#EDF1F5] rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="h-7 w-44 bg-[#EDF1F5] rounded-lg" />
          <div className="h-4 w-56 bg-[#EDF1F5] rounded mt-2" />
        </div>
        <div className="h-10 w-36 bg-[#EDF1F5] rounded-lg" />
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="h-11 flex-1 bg-[#EDF1F5] rounded-lg" />
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl p-4 sm:p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#D5DEE6]">
                {['Name', 'Mandant', 'Volumen', 'Assetklassen', 'Min. Rendite', ''].map((_, i) => (
                  <th key={i} className="px-3 py-2 sm:px-4 sm:py-3 text-left">
                    <div className="h-3 w-20 bg-[#D5DEE6] rounded" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...Array(5)].map((_, i) => (
                <SkeletonRow key={i} cols={6} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

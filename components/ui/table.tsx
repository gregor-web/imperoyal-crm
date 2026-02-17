interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <table className={`w-full min-w-[600px] sm:min-w-0 ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-[#162636] border-b border-white/[0.07]">
      {children}
    </thead>
  );
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-white/[0.05]">{children}</tbody>;
}

export function TableRow({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <tr
      className={`hover:bg-white/[0.03] transition-colors duration-100 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-3 py-2.5 sm:px-4 sm:py-3 text-left text-[11px] font-semibold text-[#6B8AAD] uppercase tracking-[0.05em] ${className}`}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`px-3 py-3 sm:px-4 text-[13px] text-[#EDF1F5] ${className}`}>
      {children}
    </td>
  );
}

// Empty State
export function TableEmpty({ message = 'Keine Daten vorhanden', colSpan = 1 }: { message?: string; colSpan?: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-[13px] text-[#6B8AAD]">
        {message}
      </td>
    </tr>
  );
}

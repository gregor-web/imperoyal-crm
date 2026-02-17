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
    <thead className="bg-[#F5F5F7] border-b border-black/[0.06]">
      {children}
    </thead>
  );
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-black/[0.05]">{children}</tbody>;
}

export function TableRow({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <tr
      className={`hover:bg-[#0071E3]/[0.03] transition-colors duration-100 ${
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
    <th className={`px-3 py-2.5 sm:px-4 sm:py-3 text-left text-[11px] font-semibold text-[#6E6E73] uppercase tracking-[0.05em] ${className}`}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`px-3 py-3 sm:px-4 text-[13px] text-[#1D1D1F] ${className}`}>
      {children}
    </td>
  );
}

// Empty State
export function TableEmpty({ message = 'Keine Daten vorhanden', colSpan = 1 }: { message?: string; colSpan?: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-[13px] text-[#6E6E73]">
        {message}
      </td>
    </tr>
  );
}

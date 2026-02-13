interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-[#EDF1F5] text-[#2A3F54]',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-[#D5DEE6] text-[#1E2A3A]',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium whitespace-nowrap ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}

// Spezielle Badges für Empfehlungen
export function EmpfehlungBadge({ empfehlung }: { empfehlung: string }) {
  const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    HALTEN: 'success',
    OPTIMIEREN: 'info',
    RESTRUKTURIEREN: 'warning',
    VERKAUFEN: 'danger',
  };

  return (
    <Badge variant={variants[empfehlung] || 'default'} size="md">
      {empfehlung}
    </Badge>
  );
}

// Status Badges
export function StatusBadge({ status }: { status: 'offen' | 'in_bearbeitung' | 'fertig' | 'bearbeitet' | 'erstellt' | 'abgeschlossen' }) {
  const variants: Record<string, 'success' | 'warning' | 'info' | 'default'> = {
    offen: 'warning',
    in_bearbeitung: 'info',
    fertig: 'success',
    bearbeitet: 'success',
    erstellt: 'info',
    abgeschlossen: 'success',
  };

  const labels: Record<string, string> = {
    offen: 'Angefragt',
    in_bearbeitung: 'In Bearbeitung',
    fertig: 'Fertig',
    bearbeitet: 'Bearbeitet',
    erstellt: 'Eingereicht',
    abgeschlossen: 'Abgeschlossen',
  };

  return (
    <Badge variant={variants[status]} size="sm">
      {labels[status]}
    </Badge>
  );
}

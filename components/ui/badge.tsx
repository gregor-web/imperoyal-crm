interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-white/[0.08] text-[#EDF1F5]',
    success: 'bg-[#34C759]/15 text-[#34C759]',
    warning: 'bg-[#FF9500]/15 text-[#FF9500]',
    danger: 'bg-[#FF3B30]/15 text-[#FF3B30]',
    info: 'bg-[#7A9BBD]/15 text-[#6B8AAD]',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-[12px]',
  };

  return (
    <span className={`inline-flex items-center rounded-[6px] font-medium whitespace-nowrap tracking-[0.01em] ${variants[variant]} ${sizes[size]} ${className}`}>
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
export function StatusBadge({ status }: { status: 'offen' | 'bezahlt' | 'in_bearbeitung' | 'fertig' | 'versendet' | 'erstellt' | 'abgeschlossen' }) {
  const variants: Record<string, 'success' | 'warning' | 'info' | 'default'> = {
    offen: 'warning',
    bezahlt: 'info',
    in_bearbeitung: 'info',
    fertig: 'success',
    versendet: 'success',
    erstellt: 'info',
    abgeschlossen: 'success',
  };

  const labels: Record<string, string> = {
    offen: 'Zahlung ausstehend',
    bezahlt: 'Bezahlt',
    in_bearbeitung: 'In Bearbeitung',
    fertig: 'Fertig',
    versendet: 'Versendet',
    erstellt: 'Eingereicht',
    abgeschlossen: 'Abgeschlossen',
  };

  return (
    <Badge variant={variants[status]} size="sm">
      {labels[status]}
    </Badge>
  );
}

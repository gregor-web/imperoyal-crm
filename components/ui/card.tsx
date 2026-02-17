interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Card({ children, className = '', title, subtitle, actions }: CardProps) {
  return (
    <div className={`glass-card rounded-2xl ${className}`}>
      {(title || actions) && (
        <div className="flex items-start justify-between p-4 sm:p-6 border-b border-black/[0.06]">
          <div className="min-w-0 flex-1">
            {title && <h3 className="text-[15px] sm:text-base font-semibold text-[#1D1D1F] tracking-[-0.01em]">{title}</h3>}
            {subtitle && <p className="text-[13px] text-[#6E6E73] mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex gap-2 ml-3 flex-shrink-0">{actions}</div>}
        </div>
      )}
      <div className={title || actions ? 'p-4 sm:p-6' : 'p-4 sm:p-6'}>{children}</div>
    </div>
  );
}

interface CardGridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  className?: string;
}

export function CardGrid({ children, cols = 3, className = '' }: CardGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid gap-4 sm:gap-6 ${gridCols[cols]} ${className}`}>
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: { value: number; label: string };
  color?: 'blue' | 'green' | 'red' | 'amber' | 'purple';
}

export function StatCard({ title, value, subtitle, icon, trend, color = 'blue' }: StatCardProps) {
  const colors = {
    blue: 'bg-[#0071E3]/10 text-[#0071E3]',
    green: 'bg-[#34C759]/10 text-[#1A8A3A]',
    red: 'bg-[#FF3B30]/10 text-[#C0392B]',
    amber: 'bg-[#FF9500]/10 text-[#B36200]',
    purple: 'bg-[#5856D6]/10 text-[#5856D6]',
  };

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[12px] sm:text-xs font-medium text-[#6E6E73] tracking-[0.02em] uppercase">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-[#1D1D1F] mt-1.5 truncate tracking-[-0.02em]">{value}</p>
          {subtitle && <p className="text-[13px] text-[#6E6E73] mt-1">{subtitle}</p>}
          {trend && (
            <p className={`text-[13px] mt-2 font-medium ${trend.value >= 0 ? 'text-[#1A8A3A]' : 'text-[#C0392B]'}`}>
              {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
            </p>
          )}
        </div>
        {icon && (
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${colors[color]} flex items-center justify-center flex-shrink-0 ml-3`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

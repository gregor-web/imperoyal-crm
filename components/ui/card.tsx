interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Card({ children, className = '', title, subtitle, actions }: CardProps) {
  return (
    <div className={`glass-card rounded-xl ${className}`}>
      {(title || actions) && (
        <div className="flex items-start justify-between p-4 sm:p-6 border-b border-white/20">
          <div className="min-w-0 flex-1">
            {title && <h3 className="text-base sm:text-lg font-semibold text-[#1E2A3A]">{title}</h3>}
            {subtitle && <p className="text-sm text-[#4A6A8D] mt-1">{subtitle}</p>}
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
    blue: 'from-[#4A6A8D] to-[#5B7A9D]',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    amber: 'from-amber-500 to-amber-600',
    purple: 'from-[#1E2A3A] to-[#2A3F54]',
  };

  return (
    <div className="glass-card rounded-xl p-4 sm:p-6">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-[#4A6A8D]">{title}</p>
          <p className="text-lg sm:text-2xl font-bold text-[#1E2A3A] mt-1 truncate">{value}</p>
          {subtitle && <p className="text-xs sm:text-sm text-[#5B7A9D] mt-1">{subtitle}</p>}
          {trend && (
            <p className={`text-xs sm:text-sm mt-2 ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
            </p>
          )}
        </div>
        {icon && (
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white flex-shrink-0 ml-3`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

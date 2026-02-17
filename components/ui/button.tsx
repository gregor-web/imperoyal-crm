import { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-[10px] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] tracking-[-0.01em]';

    const variants = {
      primary: 'bg-[#0071E3] text-white hover:bg-[#0077ED] focus:ring-[#0071E3]/40 shadow-[0_1px_2px_rgba(0,0,0,0.15)]',
      secondary: 'bg-white text-[#1D1D1F] border border-black/[0.12] hover:bg-[#F5F5F7] focus:ring-[#0071E3]/30 shadow-[0_1px_2px_rgba(0,0,0,0.06)]',
      danger: 'bg-[#FF3B30] text-white hover:bg-[#E0342A] focus:ring-[#FF3B30]/40 shadow-[0_1px_2px_rgba(0,0,0,0.15)]',
      ghost: 'text-[#0071E3] hover:bg-[#0071E3]/08 focus:ring-[#0071E3]/30',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-[13px]',
      md: 'px-4 py-2 text-[14px]',
      lg: 'px-5 py-2.5 text-[15px]',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4\" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

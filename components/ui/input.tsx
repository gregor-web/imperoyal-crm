import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-[13px] font-medium text-[#1D1D1F]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`glass-input w-full px-3.5 py-2.5 rounded-[10px] text-[#1D1D1F] placeholder-[#A1A1A6] text-[14px] ${
            error ? '!border-[#FF3B30] focus:!shadow-[0_0_0_3px_rgba(255,59,48,0.18)]' : ''
          } ${className}`}
          {...props}
        />
        {hint && !error && (
          <p className="text-sm text-[#4A6A8D]">{hint}</p>
        )}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

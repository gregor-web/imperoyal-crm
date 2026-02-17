import { forwardRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[] | readonly string[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, options, placeholder, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    const normalizedOptions = options.map((opt) =>
      typeof opt === 'string' ? { value: opt, label: opt } : opt
    );

    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={selectId} className="block text-[13px] font-medium text-[#1D1D1F]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`glass-input w-full px-3.5 py-2.5 rounded-[10px] text-[#1D1D1F] text-[14px] ${
            error ? '!border-[#FF3B30]' : ''
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}
          {normalizedOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-[12px] text-[#FF3B30]">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

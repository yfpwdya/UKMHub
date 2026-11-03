import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const variants = {
  primary:
    'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98]',
  secondary:
    'bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-[0.98]',
  outline:
    'border-2 border-indigo-600/30 hover:border-indigo-600 text-indigo-600 hover:bg-indigo-50/50 active:scale-[0.98]',
  danger:
    'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-md shadow-rose-500/20 active:scale-[0.98]',
  ghost:
    'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]',
};

const sizes = {
  sm: 'px-3.5 py-1.5 text-xs font-medium rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm font-medium rounded-xl gap-2',
  lg: 'px-7 py-3.5 text-base font-semibold rounded-2xl gap-2.5',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span>Memuat...</span>
        </>
      ) : children}
    </button>
  );
};

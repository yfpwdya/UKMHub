import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', id, ...props }) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-slate-600">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && <div className="absolute left-3.5 text-slate-400 pointer-events-none">{icon}</div>}
        <input
          id={inputId}
          className={`w-full bg-slate-50 border rounded-xl ${
            icon ? 'pl-10' : 'px-4'
          } py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
            error ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 hover:border-slate-300'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
};

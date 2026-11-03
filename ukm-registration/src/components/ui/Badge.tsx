import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  color?: 'indigo' | 'green' | 'yellow' | 'red' | 'purple' | 'blue' | 'gray';
  icon?: React.ReactNode;
}

const colors = {
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  yellow: 'bg-amber-50 text-amber-700 border-amber-200/60',
  red: 'bg-rose-50 text-rose-700 border-rose-200/60',
  purple: 'bg-violet-50 text-violet-700 border-violet-200/60',
  blue: 'bg-sky-50 text-sky-700 border-sky-200/60',
  gray: 'bg-slate-100 text-slate-600 border-slate-200/60',
};

export const Badge: React.FC<BadgeProps> = ({ children, color = 'gray', icon }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${colors[color]}`}
    >
      {icon}
      {children}
    </span>
  );
};

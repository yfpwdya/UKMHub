import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverEffect = true,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-200/50 p-6 ${
        onClick ? 'cursor-pointer' : ''
      } ${
        hoverEffect && onClick
          ? 'hover:shadow-md hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-200'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

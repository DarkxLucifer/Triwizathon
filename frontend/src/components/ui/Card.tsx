import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'cyan' | 'amber' | 'rose' | 'slate' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, size = 'sm', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-normal text-[#9a9aa2] border border-[#26262a] rounded-[4px] px-2 py-0.5 bg-[#131315] ${className}`}
    >
      {children}
    </span>
  );
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ children, className = '', onClick, hover = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-[#131315] border border-[#26262a] rounded-[6px] p-4 transition-colors duration-[120ms] ${
        hover ? 'hover:bg-[#1a1a1d] cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  ...props
}: ButtonProps) {
  const variantStyles = {
    primary:
      'bg-[#1a1a1d] hover:bg-[#222226] text-[#ededed] font-medium border border-[#26262a]',
    secondary:
      'bg-[#131315] hover:bg-[#1a1a1d] text-[#ededed] font-normal border border-[#26262a]',
    outline:
      'border border-[#26262a] hover:border-[#36363c] text-[#ededed] bg-transparent',
    danger:
      'border border-[#26262a] hover:border-red-900/50 text-[#f87171] bg-transparent',
    ghost:
      'text-[#9a9aa2] hover:text-[#ededed] hover:bg-[#131315] bg-transparent',
  };

  const sizeStyles = {
    sm: 'text-[12px] px-2.5 py-1 rounded-[6px]',
    md: 'text-[13px] px-3.5 py-1.5 rounded-[6px]',
    lg: 'text-[14px] px-4 py-2 rounded-[6px]',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 transition-colors duration-[120ms] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {icon && <span className="w-3.5 h-3.5">{icon}</span>}
      {children}
    </button>
  );
}

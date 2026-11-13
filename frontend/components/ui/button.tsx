'use client';

import type { ButtonHTMLAttributes } from 'react';

const STYLES = {
  primary: 'bg-brand text-white hover:bg-brand-dark disabled:bg-brand/50',
  ink: 'bg-ink text-white hover:bg-neutral-800 disabled:bg-neutral-400',
  ghost: 'border border-ink bg-transparent text-ink hover:bg-ink hover:text-white',
  danger: 'border border-brand text-brand hover:bg-brand hover:text-white',
};

export function Button({
  variant = 'primary',
  block,
  loading,
  className = '',
  children,
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof STYLES;
  block?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold uppercase tracking-wide transition ${STYLES[variant]} ${block ? 'w-full' : ''} ${className}`}
    >
      {loading ? 'Đang xử lý...' : children}
    </button>
  );
}

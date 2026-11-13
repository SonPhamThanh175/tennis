'use client';

import { useEffect } from 'react';

export function Drawer({
  open,
  title,
  children,
  onClose,
  side = 'right',
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  side?: 'left' | 'right';
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-[90] ${open ? '' : 'pointer-events-none'}`}>
      <button
        type="button"
        aria-label="Đóng"
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition ${open ? 'opacity-100' : 'opacity-0'}`}
      />
      <aside
        className={`absolute top-0 flex h-full w-[min(100%,20rem)] flex-col bg-white shadow-xl transition-transform duration-300 ${
          side === 'right' ? 'right-0' : 'left-0'
        } ${open ? 'translate-x-0' : side === 'right' ? 'translate-x-full' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
          <h2 className="display text-xl">{title}</h2>
          <button type="button" className="text-2xl leading-none text-neutral-400 hover:text-ink" onClick={onClose} aria-label="Đóng">
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
      </aside>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Drawer } from '@/components/ui/drawer';

export function FilterDrawer({
  activeCount,
  children,
}: {
  activeCount: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="relative inline-flex h-10 w-10 items-center justify-center border border-ink text-lg md:hidden"
        aria-label="Mở bộ lọc"
        onClick={() => setOpen(true)}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16M7 12h10M10 18h4" />
        </svg>
        {activeCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center bg-brand px-1 text-[10px] font-bold text-white">
            {activeCount}
          </span>
        )}
      </button>
      <Drawer title="Bộ lọc" side="left" open={open} onClose={() => setOpen(false)}>
        {children}
      </Drawer>
    </>
  );
}

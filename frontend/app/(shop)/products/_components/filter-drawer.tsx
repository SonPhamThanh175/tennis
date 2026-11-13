'use client';

import { FilterOutlined } from '@ant-design/icons';
import { Badge, Drawer } from 'antd';
import { useState } from 'react';

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
        className="inline-flex h-10 w-10 items-center justify-center border border-ink text-lg md:hidden"
        aria-label="Mở bộ lọc"
        onClick={() => setOpen(true)}
      >
        <Badge count={activeCount} size="small" color="#c8102e" offset={[4, -4]}>
          <FilterOutlined />
        </Badge>
      </button>
      <Drawer title="Bộ lọc" placement="left" open={open} onClose={() => setOpen(false)} size={300}>
        {children}
      </Drawer>
    </>
  );
}

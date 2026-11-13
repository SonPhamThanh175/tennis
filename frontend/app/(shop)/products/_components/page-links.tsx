'use client';

import { useRouter } from 'next/navigation';
import { buildHref, type ProductParams } from './filters';

export function PageLinks({
  current,
  page,
  total,
  pageSize,
}: {
  current: ProductParams;
  page: number;
  total: number;
  pageSize: number;
}) {
  const router = useRouter();
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;

  const go = (p: number) => router.push(buildHref(current, { page: String(p) }));
  const nums = Array.from({ length: pages }, (_, i) => i + 1);

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Phân trang">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => go(page - 1)}
        className="border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-40"
      >
        Trước
      </button>
      {nums.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => go(n)}
          className={`min-w-9 px-3 py-1.5 text-sm font-semibold ${n === page ? 'bg-ink text-white' : 'border border-neutral-300 hover:border-ink'}`}
        >
          {n}
        </button>
      ))}
      <button
        type="button"
        disabled={page >= pages}
        onClick={() => go(page + 1)}
        className="border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-40"
      >
        Sau
      </button>
    </nav>
  );
}

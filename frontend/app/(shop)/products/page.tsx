import Link from 'next/link';
import { Suspense } from 'react';
import { EmptyState, ErrorBox } from '@/components/ui/states';
import { productsApi } from '@/lib/api';
import type { Condition, PlayStyle, SkillLevel } from '@/types/api';
import { RacquetCard } from '../_components/racquet-card';
import { RacquetCardSkeletonGrid } from '../_components/racquet-card-skeleton';
import { FilterDrawer } from './_components/filter-drawer';
import { Filters, type ProductParams } from './_components/filters';
import { PageLinks } from './_components/page-links';

async function Listing({ searchParams }: { searchParams: Promise<ProductParams> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  let items;
  let total;
  let limit;
  let brands;
  try {
    [{ items, total, limit }, brands] = await Promise.all([
      productsApi.list({
        q: sp.q,
        brand: sp.brand,
        level: sp.level as SkillLevel | undefined,
        condition: sp.condition as Condition | undefined,
        playStyle: sp.playStyle as PlayStyle | undefined,
        page,
        limit: 12,
      }),
      productsApi.brands(),
    ]);
  } catch (e) {
    return <ErrorBox message={e instanceof Error ? e.message : 'Không tải được danh sách vợt.'} />;
  }

  const filterCount = [sp.q, sp.brand, sp.level, sp.condition, sp.playStyle].filter(Boolean).length;

  return (
    <div className="grid gap-10 md:grid-cols-[220px_1fr]">
      <div className="hidden md:block">
        <Filters current={sp} brands={brands} />
      </div>
      <div>
        <div className="mb-4 flex items-center justify-between gap-3 md:mb-6">
          <div className="flex items-center gap-3">
            <p className="text-sm text-neutral-500">{total} cây vợt</p>
            {filterCount > 0 && (
              <Link href="/products" className="text-sm font-semibold text-brand hover:underline">
                Xóa bộ lọc
              </Link>
            )}
          </div>
          <FilterDrawer activeCount={filterCount}>
            <Filters current={sp} brands={brands} />
          </FilterDrawer>
        </div>
        {items.length === 0 ? (
          <EmptyState message="Không tìm thấy vợt phù hợp." />
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-3">
            {items.map((p) => (
              <RacquetCard key={p.id} product={p} />
            ))}
          </div>
        )}
        <PageLinks current={sp} page={page} total={total} pageSize={limit} />
      </div>
    </div>
  );
}

function ProductsListingSkeleton() {
  return (
    <div className="grid gap-10 md:grid-cols-[220px_1fr]">
      <div className="hidden space-y-4 md:block" aria-hidden>
        <div className="h-8 w-32 animate-pulse bg-neutral-200" />
        <div className="h-36 animate-pulse bg-neutral-100" />
        <div className="h-36 animate-pulse bg-neutral-100" />
      </div>
      <RacquetCardSkeletonGrid
        count={12}
        className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-3"
      />
    </div>
  );
}

export default function ProductsPage({ searchParams }: PageProps<'/products'>) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="display mb-6 text-4xl md:mb-8 md:text-6xl">Vợt tennis</h1>
      <Suspense fallback={<ProductsListingSkeleton />}>
        <Listing searchParams={searchParams as Promise<ProductParams>} />
      </Suspense>
    </div>
  );
}

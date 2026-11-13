import { Suspense } from 'react';
import { EmptyState, ErrorBox, Spinner } from '@/components/ui/states';
import { productsApi } from '@/lib/api';
import type { Condition, PlayStyle, SkillLevel } from '@/types/api';
import { RacquetCard } from '../_components/racquet-card';
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

  return (
    <div className="grid gap-10 md:grid-cols-[220px_1fr]">
      <Filters current={sp} brands={brands} />
      <div>
        <p className="mb-6 text-sm text-neutral-500">{total} cây vợt</p>
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

export default function ProductsPage({ searchParams }: PageProps<'/products'>) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="display mb-8 text-6xl">Vợt tennis</h1>
      <Suspense fallback={<Spinner />}>
        <Listing searchParams={searchParams as Promise<ProductParams>} />
      </Suspense>
    </div>
  );
}

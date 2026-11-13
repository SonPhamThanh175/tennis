import { productsApi } from '@/lib/api';
import { RacquetCard } from '../../../_components/racquet-card';

export async function RelatedRacquets({ slug }: { slug: string }) {
  const items = await productsApi.related(slug).catch(() => []);
  if (items.length === 0) return null;

  return (
    <section className="mt-16 border-t border-neutral-200 pt-12">
      <h2 className="display mb-8 text-3xl md:text-5xl">Gợi ý cùng loại</h2>
      <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-6">
        {items.map((p) => (
          <RacquetCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

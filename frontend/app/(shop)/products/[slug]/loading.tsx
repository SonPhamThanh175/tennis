import { RacquetCardSkeletonGrid } from '../../_components/racquet-card-skeleton';

export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-12 md:grid-cols-2">
        <div className="aspect-square animate-pulse bg-neutral-200" />
        <div className="space-y-4" aria-hidden>
          <div className="h-4 w-20 animate-pulse bg-neutral-200" />
          <div className="h-10 w-3/4 animate-pulse bg-neutral-200" />
          <div className="h-24 animate-pulse bg-neutral-100" />
          <div className="h-32 animate-pulse bg-neutral-100" />
        </div>
      </div>
      <section className="mt-16 border-t border-neutral-200 pt-12">
        <div className="mb-8 h-10 w-56 animate-pulse bg-neutral-200" />
        <RacquetCardSkeletonGrid
          count={6}
          className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-6"
        />
      </section>
    </div>
  );
}

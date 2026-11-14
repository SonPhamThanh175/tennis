import { RacquetCardSkeletonGrid } from '../_components/racquet-card-skeleton';

export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 h-12 w-64 animate-pulse bg-neutral-200" />
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
    </div>
  );
}

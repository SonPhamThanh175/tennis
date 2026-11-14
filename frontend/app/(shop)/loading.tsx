import { RacquetCardSkeletonGrid } from './_components/racquet-card-skeleton';

export default function ShopLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 h-10 w-48 animate-pulse bg-neutral-200" />
      <RacquetCardSkeletonGrid
        count={8}
        className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4"
      />
    </div>
  );
}

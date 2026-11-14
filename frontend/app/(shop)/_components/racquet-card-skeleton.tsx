/** Khung xương cùng tỉ lệ thẻ vợt, dùng khi đang tải danh sách. */
export function RacquetCardSkeleton() {
  return (
    <div aria-hidden>
      <div className="aspect-square animate-pulse bg-neutral-200" />
      <div className="space-y-2 pt-3">
        <div className="h-3 w-16 animate-pulse bg-neutral-200" />
        <div className="h-6 w-3/4 animate-pulse bg-neutral-200" />
        <div className="h-3 w-1/2 animate-pulse bg-neutral-200" />
        <div className="mt-2 h-5 w-24 animate-pulse bg-neutral-200" />
      </div>
    </div>
  );
}

export function RacquetCardSkeletonGrid({
  count,
  className,
}: {
  count: number;
  className: string;
}) {
  return (
    <div className={className} aria-busy="true" aria-label="Đang tải vợt">
      {Array.from({ length: count }, (_, i) => (
        <RacquetCardSkeleton key={i} />
      ))}
    </div>
  );
}

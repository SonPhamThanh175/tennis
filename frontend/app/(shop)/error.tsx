'use client';

import { Button } from '@/components/ui/button';

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="display text-4xl">Không tải được trang</h1>
      <p className="mt-3 text-neutral-600">{error.message}</p>
      <Button className="mt-6" onClick={reset}>
        Thử lại
      </Button>
    </div>
  );
}

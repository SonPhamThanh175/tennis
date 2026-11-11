import { Suspense } from 'react';
import { RequireAuth } from '@/components/ui/require-auth';
import { Spinner } from '@/components/ui/states';
import { OrderHistory } from './_components/order-history';

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="display mb-8 text-6xl">Đơn hàng của tôi</h1>
      <RequireAuth>
        <Suspense fallback={<Spinner />}>
          <OrderHistory />
        </Suspense>
      </RequireAuth>
    </div>
  );
}

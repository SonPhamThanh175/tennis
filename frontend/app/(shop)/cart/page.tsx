import { RequireAuth } from '@/components/ui/require-auth';
import { CartView } from './_components/cart-view';

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="display mb-8 text-6xl">Giỏ hàng</h1>
      <RequireAuth>
        <CartView />
      </RequireAuth>
    </div>
  );
}

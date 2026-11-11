import { RequireAuth } from '@/components/ui/require-auth';
import { CheckoutForm } from './_components/checkout-form';

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="display mb-8 text-6xl">Thanh toán</h1>
      <RequireAuth>
        <CheckoutForm />
      </RequireAuth>
    </div>
  );
}

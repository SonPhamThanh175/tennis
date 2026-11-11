'use client';

import { DeleteOutlined } from '@ant-design/icons';
import { App, Button, InputNumber } from 'antd';
import Link from 'next/link';
import { Spinner, EmptyState } from '@/components/ui/states';
import { CONDITION_LABEL, formatVnd, GRIP_LABEL } from '@/lib/format';
import { useCart } from '@/providers/cart-provider';

export function CartView() {
  const { cart, remove } = useCart();
  const { message } = App.useApp();

  if (!cart) return <Spinner />;
  if (cart.items.length === 0) {
    return (
      <EmptyState
        message="Giỏ hàng đang trống."
        action={<Link href="/products"><Button type="primary">Xem kho vợt</Button></Link>}
      />
    );
  }

  return (
    <div className="grid gap-10 md:grid-cols-[1fr_340px]">
      <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
        {cart.items.map((item) => (
          <li key={item.id} className="flex items-center gap-4 py-4">
            <div className="flex-1">
              <Link href={`/products/${item.variant.product.slug}`} className="display text-xl hover:text-brand">
                {item.variant.product.name}
              </Link>
              <p className="text-xs text-neutral-500">
                {item.variant.internalCode} · Grip {GRIP_LABEL(item.variant.gripSize)} · {CONDITION_LABEL[item.variant.condition]}
              </p>
            </div>
            <InputNumber disabled value={item.quantity} min={1} max={1} className="!w-14" />
            <strong className="w-32 text-right">{formatVnd(item.variant.price * item.quantity)}</strong>
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              aria-label="Xóa"
              onClick={() => remove(item.id).catch((e) => message.error(e.message))}
            />
          </li>
        ))}
      </ul>
      <aside className="h-fit space-y-4 bg-paper p-6">
        <div className="flex justify-between text-lg font-bold">
          <span>Tổng cộng</span>
          <span>{formatVnd(cart.totalPrice)}</span>
        </div>
        <Link href="/checkout">
          <Button type="primary" size="large" block>THANH TOÁN</Button>
        </Link>
      </aside>
    </div>
  );
}

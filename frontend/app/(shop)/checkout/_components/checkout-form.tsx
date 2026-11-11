'use client';

import { Button, Form, Input, Radio } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { EmptyState, ErrorBox, Spinner } from '@/components/ui/states';
import { ordersApi } from '@/lib/api';
import { formatVnd, PAYMENT_LABEL, toOptions } from '@/lib/format';
import { useAuth } from '@/providers/auth-provider';
import { useCart } from '@/providers/cart-provider';
import type { Address, PaymentMethod } from '@/types/api';

type Values = Address & { paymentMethod: PaymentMethod; note?: string };

export function CheckoutForm() {
  const { token, user } = useAuth();
  const { cart, refresh } = useCart();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!cart) return <Spinner />;
  if (cart.items.length === 0) {
    return (
      <EmptyState
        message="Giỏ hàng trống."
        action={<Link href="/products"><Button type="primary">Tiếp tục mua sắm</Button></Link>}
      />
    );
  }

  async function onFinish({ paymentMethod, note, ...address }: Values) {
    setBusy(true);
    setError('');
    try {
      await ordersApi.create(token!, { address, paymentMethod, note: note || undefined });
      await refresh();
      router.push('/orders?placed=1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đặt hàng thất bại');
      setBusy(false);
    }
  }

  return (
    <Form<Values>
      layout="vertical"
      size="large"
      requiredMark={false}
      initialValues={{ fullName: user?.fullName, paymentMethod: 'COD' }}
      onFinish={onFinish}
      className="grid gap-10 md:grid-cols-[1fr_340px]"
    >
      <div>
        <h2 className="display mb-4 text-2xl">Địa chỉ giao hàng</h2>
        <div className="grid gap-x-4 sm:grid-cols-2">
          <Form.Item name="fullName" label="Họ tên" rules={[{ required: true, message: 'Nhập họ tên' }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, pattern: /^(0|\+84)\d{9}$/, message: 'Số điện thoại không hợp lệ' }]}
          >
            <Input />
          </Form.Item>
        </div>
        <Form.Item name="line1" label="Số nhà, tên đường" rules={[{ required: true, message: 'Nhập địa chỉ' }]}>
          <Input />
        </Form.Item>
        <div className="grid gap-x-4 sm:grid-cols-3">
          <Form.Item name="ward" label="Phường/Xã"><Input /></Form.Item>
          <Form.Item name="district" label="Quận/Huyện"><Input /></Form.Item>
          <Form.Item name="city" label="Tỉnh/Thành phố" rules={[{ required: true, message: 'Nhập tỉnh/thành' }]}>
            <Input />
          </Form.Item>
        </div>
        <Form.Item name="note" label="Ghi chú"><Input.TextArea rows={2} /></Form.Item>
        <h2 className="display mb-4 mt-6 text-2xl">Thanh toán</h2>
        <Form.Item name="paymentMethod" noStyle>
          <Radio.Group
            className="flex flex-col gap-2"
            options={toOptions(PAYMENT_LABEL)}
          />
        </Form.Item>
      </div>
      <aside className="h-fit space-y-3 bg-paper p-6">
        <h2 className="display text-2xl">Đơn hàng</h2>
        {cart.items.map((i) => (
          <div key={i.id} className="flex justify-between gap-3 text-sm">
            <span>{i.variant.product.name} ({i.variant.internalCode})</span>
            <span>{formatVnd(i.variant.price * i.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-neutral-300 pt-3 text-lg font-bold">
          <span>Tổng</span>
          <span>{formatVnd(cart.totalPrice)}</span>
        </div>
        {error && <ErrorBox message={error} />}
        <Button type="primary" htmlType="submit" size="large" block loading={busy}>ĐẶT HÀNG</Button>
      </aside>
    </Form>
  );
}

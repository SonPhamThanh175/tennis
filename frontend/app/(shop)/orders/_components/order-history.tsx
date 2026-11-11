'use client';

import { Alert, App, Button, Popconfirm, Tag } from 'antd';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { EmptyState, ErrorBox, Spinner } from '@/components/ui/states';
import { ordersApi } from '@/lib/api';
import { formatDate, formatVnd, ORDER_STATUS_COLOR, ORDER_STATUS_LABEL, PAYMENT_LABEL } from '@/lib/format';
import { useAuth } from '@/providers/auth-provider';
import type { Order } from '@/types/api';

export function OrderHistory() {
  const { token } = useAuth();
  const { message } = App.useApp();
  const placed = useSearchParams().get('placed');
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setOrders(await ordersApi.list(token!));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi tải đơn hàng');
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function cancel(id: string) {
    try {
      await ordersApi.cancel(token!, id);
      await load();
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Không thể hủy đơn');
    }
  }

  if (!orders && !error) return <Spinner />;

  return (
    <div className="space-y-4">
      {placed && <Alert type="success" showIcon title="Đặt hàng thành công! Cảm ơn bạn." />}
      {error && <ErrorBox message={error} />}
      {orders?.length === 0 && <EmptyState message="Bạn chưa có đơn hàng nào." />}
      {orders?.map((o) => (
        <div key={o.id} className="border border-neutral-200 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-mono text-xs text-neutral-400">#{o.id.slice(-8).toUpperCase()}</p>
              <p className="text-sm text-neutral-500">{formatDate(o.createdAt)}</p>
            </div>
            <Tag color={ORDER_STATUS_COLOR[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Tag>
          </div>
          <ul className="mt-3 text-sm">
            {o.items.map((i) => (
              <li key={i.id} className="flex justify-between py-0.5">
                <span>{i.productName} × {i.quantity}</span>
                <span>{formatVnd(i.unitPrice * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-neutral-200 pt-3">
            <span className="text-xs text-neutral-500">
              {o.payment && PAYMENT_LABEL[o.payment.method]} · {o.address.city}
            </span>
            <div className="flex items-center gap-4">
              <strong>{formatVnd(o.totalPrice)}</strong>
              {o.status === 'PENDING' && (
                <Popconfirm title="Hủy đơn hàng này?" okText="Hủy đơn" cancelText="Không" onConfirm={() => cancel(o.id)}>
                  <Button danger size="small">Hủy đơn</Button>
                </Popconfirm>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

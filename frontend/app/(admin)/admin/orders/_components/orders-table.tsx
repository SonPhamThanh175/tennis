'use client';

import { App, Select, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { formatDate, formatVnd, ORDER_STATUS_COLOR, ORDER_STATUS_LABEL, PAYMENT_LABEL, toOptions } from '@/lib/format';
import { useAuth } from '@/providers/auth-provider';
import type { Order, OrderStatus } from '@/types/api';

const profitOf = (o: Order) =>
  o.items.reduce((s, i) => s + (i.unitPrice - (i.unitCost ?? i.unitPrice)) * i.quantity, 0);

export function OrdersTable() {
  const { token } = useAuth();
  const { message } = App.useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | undefined>();
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setOrders(await adminApi.orders(token!, filter));
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Lỗi tải đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [token, filter, message]);

  useEffect(() => {
    load();
  }, [load]);

  async function changeStatus(id: string, status: OrderStatus) {
    try {
      await adminApi.setOrderStatus(token!, id, status);
      message.success('Đã cập nhật trạng thái');
      await load();
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Không thể cập nhật');
    }
  }

  const columns: ColumnsType<Order> = [
    { title: 'Mã', dataIndex: 'id', render: (id: string) => <code>#{id.slice(-8).toUpperCase()}</code> },
    { title: 'Khách', render: (_, o) => o.user?.fullName ?? o.address.fullName },
    { title: 'Ngày', dataIndex: 'createdAt', render: formatDate },
    {
      title: 'Sản phẩm',
      render: (_, o) => o.items.map((i) => <div key={i.id}>{i.productName} × {i.quantity}</div>),
    },
    { title: 'Thanh toán', render: (_, o) => (o.payment ? PAYMENT_LABEL[o.payment.method] : '—') },
    { title: 'Tổng', dataIndex: 'totalPrice', render: formatVnd, align: 'right' },
    { title: 'Lợi nhuận', render: (_, o) => formatVnd(profitOf(o)), align: 'right' },
    {
      title: 'Trạng thái',
      render: (_, o) => (
        <Select
          size="small"
          value={o.status}
          style={{ width: 150 }}
          options={toOptions(ORDER_STATUS_LABEL)}
          labelRender={() => <Tag color={ORDER_STATUS_COLOR[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Tag>}
          onChange={(s) => changeStatus(o.id, s)}
        />
      ),
    },
  ];

  return (
    <>
      <Select
        allowClear
        placeholder="Lọc theo trạng thái"
        className="mb-4 !w-56"
        options={toOptions(ORDER_STATUS_LABEL)}
        onChange={setFilter}
      />
      <Table rowKey="id" loading={loading} columns={columns} dataSource={orders} scroll={{ x: 'max-content' }} />
    </>
  );
}

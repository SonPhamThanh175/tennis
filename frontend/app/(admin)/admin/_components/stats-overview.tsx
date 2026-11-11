'use client';

import { Card, Col, Row, Statistic, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { ErrorBox, Spinner } from '@/components/ui/states';
import { adminApi } from '@/lib/api';
import { formatVnd, ORDER_STATUS_COLOR, ORDER_STATUS_LABEL } from '@/lib/format';
import { useAuth } from '@/providers/auth-provider';
import type { AdminStats, OrderStatus } from '@/types/api';

export function StatsOverview() {
  const { token } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.stats(token!).then(setStats, (e) => setError(e.message));
  }, [token]);

  if (error) return <ErrorBox message={error} />;
  if (!stats) return <Spinner />;

  const cards = [
    { title: 'Doanh thu', value: formatVnd(stats.revenue) },
    { title: 'Lợi nhuận gộp', value: formatVnd(stats.profit) },
    { title: 'Vợt đang còn hàng', value: stats.inStock },
    { title: 'Tổng đơn hàng', value: stats.orders },
  ];

  return (
    <div className="space-y-6">
      <Row gutter={[16, 16]}>
        {cards.map((c) => (
          <Col key={c.title} xs={24} sm={12} xl={6}>
            <Card>
              <Statistic title={c.title} value={c.value} />
            </Card>
          </Col>
        ))}
      </Row>
      <Card title="Đơn hàng theo trạng thái">
        <div className="flex flex-wrap gap-3">
          {(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((s) => (
            <Tag key={s} color={ORDER_STATUS_COLOR[s]} className="!px-3 !py-1 !text-sm">
              {ORDER_STATUS_LABEL[s]}: {stats.ordersByStatus[s] ?? 0}
            </Tag>
          ))}
        </div>
      </Card>
    </div>
  );
}

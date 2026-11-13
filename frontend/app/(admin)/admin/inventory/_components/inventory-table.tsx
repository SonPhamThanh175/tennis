'use client';

import { App, Button, Popconfirm, Switch, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { CONDITION_LABEL, CONDITION_TAG_COLOR, formatVnd, GRIP_LABEL } from '@/lib/format';
import { useAuth } from '@/providers/auth-provider';
import type { AdminVariant, Brand, Category, Condition } from '@/types/api';
import { RacquetFormModal } from './racquet-form-modal';

export function InventoryTable() {
  const { token } = useAuth();
  const { message } = App.useApp();
  const [rows, setRows] = useState<AdminVariant[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [editing, setEditing] = useState<AdminVariant | 'new' | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [v, b, c] = await Promise.all([
        adminApi.variants(token!, onlyInStock ? true : undefined),
        adminApi.taxonomy(token!, 'brands'),
        adminApi.taxonomy(token!, 'categories'),
      ]);
      setRows(v);
      setBrands(b);
      setCategories(c);
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Lỗi tải kho');
    } finally {
      setLoading(false);
    }
  }, [token, onlyInStock, message]);

  useEffect(() => {
    load();
  }, [load]);

  async function run(action: () => Promise<unknown>, okMsg?: string) {
    try {
      await action();
      if (okMsg) message.success(okMsg);
      await load();
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Không thể thực hiện');
    }
  }

  const columns: ColumnsType<AdminVariant> = [
    {
      title: 'Ảnh',
      width: 72,
      render: (_, r) =>
        r.images[0] ? (
          <img src={r.images[0]} alt={r.product.name} className="h-12 w-12 rounded object-cover" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded bg-neutral-100 text-xs text-neutral-400">
            —
          </div>
        ),
    },
    { title: 'Mã', dataIndex: 'internalCode', render: (c: string) => <code>{c}</code> },
    {
      title: 'Vợt',
      render: (_, r) => (
        <div>
          <div className="font-medium">{r.product.name}</div>
          <div className="text-xs text-neutral-500">
            {r?.product?.brand?.name} · {r?.product?.weightGrams}g · {r?.product?.headSizeSqIn} in²
          </div>
        </div>
      ),
    },
    { title: 'Grip', dataIndex: 'gripSize', render: GRIP_LABEL },
    {
      title: 'Tình trạng',
      dataIndex: 'condition',
      render: (c: Condition) => <Tag color={CONDITION_TAG_COLOR[c]}>{CONDITION_LABEL[c]}</Tag>,
    },
    { title: 'Giá bán', dataIndex: 'price', render: formatVnd, align: 'right' },
    { title: 'Giá vốn', dataIndex: 'costPrice', render: (v: number | null) => (v == null ? '—' : formatVnd(v)), align: 'right' },
    {
      title: 'Lãi',
      align: 'right',
      render: (_, r) => (r.costPrice == null ? '—' : formatVnd(r.price - r.costPrice)),
    },
    {
      title: 'Còn hàng',
      render: (_, r) => (
        <Switch
          checked={r.stock > 0}
          onChange={(on) => run(() => adminApi.updateVariant(token!, r.id, { stock: on ? 1 : 0 }))}
        />
      ),
    },
    {
      title: 'Hiển thị',
      render: (_, r) =>
        r.product.isActive ? (
          <Popconfirm
            title="Ẩn cây vợt này khỏi cửa hàng?"
            onConfirm={() => run(() => adminApi.deactivateProduct(token!, r.product.id), 'Đã ẩn')}
          >
            <Tag color="green" className="cursor-pointer">Đang bán</Tag>
          </Popconfirm>
        ) : (
          <Tag
            className="cursor-pointer"
            onClick={() => run(() => adminApi.updateProduct(token!, r.product.id, { isActive: true }), 'Đã hiện lại')}
          >
            Đã ẩn
          </Tag>
        ),
    },
    {
      title: '',
      render: (_, r) => (
        <Button size="small" onClick={() => setEditing(r)}>
          Sửa
        </Button>
      ),
    },
  ];

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Switch checked={onlyInStock} onChange={setOnlyInStock} /> Chỉ hiện vợt còn hàng
        </div>
        <Button type="primary" onClick={() => setEditing('new')}>
          Thêm vợt cũ
        </Button>
      </div>
      <Table rowKey="id" loading={loading} columns={columns} dataSource={rows} scroll={{ x: 'max-content' }} />
      {editing && (
        <RacquetFormModal
          variantId={editing === 'new' ? null : editing.id}
          brands={brands.filter((b) => b.isActive)}
          categories={categories.filter((c) => c.isActive)}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </>
  );
}

'use client';

import { App, Button, Popconfirm, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { LEVEL_LABEL, PLAY_STYLE_LABEL } from '@/lib/format';
import { useAuth } from '@/providers/auth-provider';
import type { Brand, Category, Product } from '@/types/api';
import { ModelFormModal } from './model-form-modal';

export function ModelsTable() {
  const { token } = useAuth();
  const { message } = App.useApp();
  const [rows, setRows] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | 'new' | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, b, c] = await Promise.all([
        adminApi.products(token!),
        adminApi.taxonomy(token!, 'brands'),
        adminApi.taxonomy(token!, 'categories'),
      ]);
      setRows(p);
      setBrands(b);
      setCategories(c);
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [token, message]);

  useEffect(() => {
    load();
  }, [load]);

  const columns: ColumnsType<Product> = [
    { title: 'Tên mẫu', dataIndex: 'name' },
    { title: 'Thương hiệu', render: (_, r) => r.brand.name },
    { title: 'Danh mục', render: (_, r) => r.category.name },
    { title: 'Thông số', render: (_, r) => `${r.weightGrams}g · ${r.headSizeSqIn} in² · ${r.stringPattern.slice(1)}` },
    { title: 'Trình độ', dataIndex: 'level', render: (l: Product['level']) => LEVEL_LABEL[l] },
    { title: 'Lối chơi', dataIndex: 'playStyle', render: (p: Product['playStyle']) => PLAY_STYLE_LABEL[p] },
    { title: 'Số cây', render: (_, r) => r.variants.length, align: 'right' },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      render: (a: boolean) => (a ? <Tag color="green">Đang bán</Tag> : <Tag>Đã ẩn</Tag>),
    },
    {
      title: '',
      render: (_, r) => (
        <div className="flex gap-2">
          <Button size="small" onClick={() => setEditing(r)}>Sửa</Button>
          {r.isActive && (
            <Popconfirm
              title="Ẩn mẫu vợt này khỏi cửa hàng?"
              onConfirm={async () => {
                try {
                  await adminApi.deactivateProduct(token!, r.id);
                  message.success('Đã ẩn');
                  await load();
                } catch (e) {
                  message.error(e instanceof Error ? e.message : 'Không thể ẩn');
                }
              }}
            >
              <Button size="small" danger>Ẩn</Button>
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <Button type="primary" className="mb-4" onClick={() => setEditing('new')}>
        Thêm mẫu vợt
      </Button>
      <Table rowKey="id" loading={loading} columns={columns} dataSource={rows} scroll={{ x: 'max-content' }} />
      {editing && (
        <ModelFormModal
          product={editing === 'new' ? null : editing}
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

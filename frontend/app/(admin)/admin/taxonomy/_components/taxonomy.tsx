'use client';

import { App, Button, Card, Form, Input, Popconfirm, Switch, Table } from 'antd';
import { Modal } from '@/components/ui/modal';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useState } from 'react';
import { adminApi, type TaxonomyKind } from '@/lib/api';
import { slugify } from '@/lib/slug';
import { useAuth } from '@/providers/auth-provider';
import type { TaxonomyItem } from '@/types/api';

export function Taxonomy({ kind, title }: { kind: TaxonomyKind; title: string }) {
  const { token } = useAuth();
  const { message } = App.useApp();
  const [items, setItems] = useState<TaxonomyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<TaxonomyItem | 'new' | null>(null);
  const [form] = Form.useForm<{ name: string; slug: string }>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await adminApi.taxonomy(token!, kind));
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [token, kind, message]);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      await fn();
      message.success(ok);
      await load();
      return true;
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Có lỗi xảy ra');
      return false;
    }
  };

  async function onSave() {
    const v = await form.validateFields();
    const ok = await run(
      () =>
        editing === 'new'
          ? adminApi.createTaxonomy(token!, kind, v)
          : adminApi.updateTaxonomy(token!, kind, (editing as TaxonomyItem).id, v),
      'Đã lưu',
    );
    if (ok) setEditing(null);
  }

  const columns: ColumnsType<TaxonomyItem> = [
    { title: 'Tên', dataIndex: 'name' },
    { title: 'Slug', dataIndex: 'slug', render: (s: string) => <code>{s}</code> },
    { title: 'Số mẫu', dataIndex: ['_count', 'products'], align: 'right' },
    {
      title: 'Hiển thị',
      render: (_, r) => (
        <Switch
          checked={r.isActive}
          onChange={(isActive) => run(() => adminApi.updateTaxonomy(token!, kind, r.id, { isActive }), 'Đã cập nhật')}
        />
      ),
    },
    {
      title: '',
      align: 'right',
      render: (_, r) => (
        <div className="flex justify-end gap-2">
          <Button
            size="small"
            onClick={() => {
              form.setFieldsValue({ name: r.name, slug: r.slug });
              setEditing(r);
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa mục này?"
            description={r._count.products > 0 ? 'Đang có mẫu vợt sử dụng, hệ thống sẽ từ chối xóa.' : undefined}
            onConfirm={() => run(() => adminApi.deleteTaxonomy(token!, kind, r.id), 'Đã xóa')}
          >
            <Button size="small" danger>Xóa</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <Card
      title={title}
      extra={
        <Button
          type="primary"
          onClick={() => {
            form.resetFields();
            setEditing('new');
          }}
        >
          Thêm mới
        </Button>
      }
    >
      <Table rowKey="id" size="small" loading={loading} columns={columns} dataSource={items} pagination={false} />
      <Modal
        open={editing !== null}
        title={editing === 'new' ? `Thêm ${title.toLowerCase()}` : `Sửa ${title.toLowerCase()}`}
        okText="Lưu"
        cancelText="Hủy"
        onOk={onSave}
        onClose={() => setEditing(null)}
      >
        <Form
          form={form}
          layout="vertical"
          onValuesChange={(c) => {
            if (editing === 'new' && 'name' in c) form.setFieldValue('slug', slugify(c.name ?? ''));
          }}
        >
          <Form.Item name="name" label="Tên" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item
            name="slug"
            label="Slug"
            rules={[{ required: true, pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: 'Chỉ gồm chữ thường, số, gạch ngang' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

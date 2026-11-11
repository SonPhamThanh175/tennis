'use client';

import { App, Button, Form, Input, InputNumber, Modal, Select, Switch, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { CONDITION_LABEL, CONDITION_TAG_COLOR, formatVnd, GRIP_LABEL, toOptions } from '@/lib/format';
import { useAuth } from '@/providers/auth-provider';
import type { AdminVariant, Condition, GripSize, UpdateVariantInput } from '@/types/api';

const GRIPS: GripSize[] = ['G0', 'G1', 'G2', 'G3', 'G4', 'G5'];

export function InventoryTable() {
  const { token } = useAuth();
  const { message } = App.useApp();
  const [rows, setRows] = useState<AdminVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [editing, setEditing] = useState<AdminVariant | null>(null);
  const [form] = Form.useForm<UpdateVariantInput>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await adminApi.variants(token!, onlyInStock ? true : undefined));
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Lỗi tải kho');
    } finally {
      setLoading(false);
    }
  }, [token, onlyInStock, message]);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    const values = await form.validateFields();
    try {
      await adminApi.updateVariant(token!, editing!.id, values);
      message.success('Đã lưu');
      setEditing(null);
      await load();
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Không thể lưu');
    }
  }

  const columns: ColumnsType<AdminVariant> = [
    { title: 'Mã', dataIndex: 'internalCode', render: (c: string) => <code>{c}</code> },
    { title: 'Mẫu vợt', render: (_, r) => r.product.name },
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
          onChange={async (on) => {
            try {
              await adminApi.updateVariant(token!, r.id, { stock: on ? 1 : 0 });
              await load();
            } catch (e) {
              message.error(e instanceof Error ? e.message : 'Không thể cập nhật');
            }
          }}
        />
      ),
    },
    {
      title: '',
      render: (_, r) => (
        <Button
          size="small"
          onClick={() => {
            form.setFieldsValue({
              gripSize: r.gripSize,
              condition: r.condition,
              conditionNote: r.conditionNote ?? '',
              price: r.price,
              originalPrice: r.originalPrice ?? undefined,
              costPrice: r.costPrice ?? undefined,
            });
            setEditing(r);
          }}
        >
          Sửa
        </Button>
      ),
    },
  ];

  return (
    <>
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Switch checked={onlyInStock} onChange={setOnlyInStock} /> Chỉ hiện vợt còn hàng
      </div>
      <Table rowKey="id" loading={loading} columns={columns} dataSource={rows} scroll={{ x: 'max-content' }} />
      <Modal
        open={!!editing}
        title={editing ? `Sửa ${editing.internalCode} · ${editing.product.name}` : ''}
        okText="Lưu"
        cancelText="Hủy"
        onOk={save}
        onCancel={() => setEditing(null)}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="gripSize" label="Grip" rules={[{ required: true }]}>
            <Select options={GRIPS.map((g) => ({ value: g, label: GRIP_LABEL(g) }))} />
          </Form.Item>
          <Form.Item name="condition" label="Tình trạng" rules={[{ required: true }]}>
            <Select options={toOptions(CONDITION_LABEL)} />
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(a, b) => a.condition !== b.condition}
          >
            {({ getFieldValue }) => (
              <Form.Item
                name="conditionNote"
                label="Mô tả tình trạng"
                rules={[{ required: getFieldValue('condition') !== 'NEW', message: 'Hàng cũ phải có mô tả tình trạng' }]}
              >
                <Input.TextArea rows={3} placeholder="VD: Sơn trầy nhẹ khung, grip mới thay" />
              </Form.Item>
            )}
          </Form.Item>
          <div className="grid grid-cols-3 gap-3">
            <Form.Item name="price" label="Giá bán" rules={[{ required: true }]}>
              <InputNumber min={0} step={10000} className="!w-full" />
            </Form.Item>
            <Form.Item name="originalPrice" label="Giá gốc">
              <InputNumber min={0} step={10000} className="!w-full" />
            </Form.Item>
            <Form.Item name="costPrice" label="Giá vốn">
              <InputNumber min={0} step={10000} className="!w-full" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </>
  );
}

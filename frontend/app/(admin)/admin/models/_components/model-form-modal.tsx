'use client';

import { App, Divider, Form, Input, InputNumber, Modal, Select } from 'antd';
import { useState } from 'react';
import { adminApi } from '@/lib/api';
import {
  BALANCE_LABEL,
  CONDITION_LABEL,
  GRIP_LABEL,
  LEVEL_LABEL,
  PLAY_STYLE_LABEL,
  STRING_PATTERN_LABEL,
  toOptions,
} from '@/lib/format';
import { slugify } from '@/lib/slug';
import { useAuth } from '@/providers/auth-provider';
import type { Brand, Category, CreateProductInput, Product, VariantInput } from '@/types/api';

type FormValues = Omit<CreateProductInput, 'variants'> & { variant?: VariantInput };

const GRIPS = ['G0', 'G1', 'G2', 'G3', 'G4', 'G5'] as const;

interface Props {
  product: Product | null;
  brands: Brand[];
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

/** Tạo/sửa mẫu vợt. Khi tạo mới, kèm cây vợt đầu tiên; các cây khác thêm sau ở trang Kho. */
export function ModelFormModal({ product, brands, categories, onClose, onSaved }: Props) {
  const { token } = useAuth();
  const { message } = App.useApp();
  const [form] = Form.useForm<FormValues>();
  const [saving, setSaving] = useState(false);
  const isNew = !product;

  async function submit() {
    const v = await form.validateFields();
    setSaving(true);
    try {
      if (product) {
        const { slug: _slug, variant: _variant, ...rest } = v;
        await adminApi.updateProduct(token!, product.id, { ...rest, images: product.images });
      } else {
        const { variant, ...rest } = v;
        await adminApi.createProduct(token!, {
          ...rest,
          images: [],
          variants: [{ ...variant!, images: [], stock: 1 }],
        });
      }
      message.success('Đã lưu mẫu vợt');
      onSaved();
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Không thể lưu');
    } finally {
      setSaving(false);
    }
  }

  const req = [{ required: true, message: 'Bắt buộc' }];

  return (
    <Modal
      open
      width={760}
      title={isNew ? 'Thêm mẫu vợt' : `Sửa ${product.name}`}
      okText="Lưu"
      cancelText="Hủy"
      confirmLoading={saving}
      onOk={submit}
      onCancel={onClose}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={
          product
            ? { ...product, brandId: product.brand.id, categoryId: product.category.id }
            : { weightGrams: 300, headSizeSqIn: 100, variant: { condition: 'GOOD', gripSize: 'G2' } }
        }
        onValuesChange={(c) => {
          if (isNew && 'name' in c) form.setFieldValue('slug', slugify(c.name ?? ''));
        }}
      >
        <div className="grid gap-x-4 sm:grid-cols-2">
          <Form.Item name="name" label="Tên mẫu" rules={req}><Input placeholder="Pro Staff 97 v14" /></Form.Item>
          <Form.Item
            name="slug"
            label="Slug"
            rules={[{ required: true, pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: 'Chỉ gồm chữ thường, số, gạch ngang' }]}
          >
            <Input disabled={!isNew} />
          </Form.Item>
          <Form.Item name="brandId" label="Thương hiệu" rules={req}>
            <Select options={brands.map((b) => ({ value: b.id, label: b.name }))} />
          </Form.Item>
          <Form.Item name="categoryId" label="Danh mục" rules={req}>
            <Select options={categories.map((c) => ({ value: c.id, label: c.name }))} />
          </Form.Item>
          <Form.Item name="level" label="Trình độ" rules={req}><Select options={toOptions(LEVEL_LABEL)} /></Form.Item>
          <Form.Item name="playStyle" label="Lối chơi" rules={req}><Select options={toOptions(PLAY_STYLE_LABEL)} /></Form.Item>
          <Form.Item name="weightGrams" label="Trọng lượng (g)" rules={req}><InputNumber min={200} max={400} className="!w-full" /></Form.Item>
          <Form.Item name="headSizeSqIn" label="Mặt vợt (in²)" rules={req}><InputNumber min={80} max={120} className="!w-full" /></Form.Item>
          <Form.Item name="balance" label="Cân bằng" rules={req}><Select options={toOptions(BALANCE_LABEL)} /></Form.Item>
          <Form.Item name="stringPattern" label="Mắt cước" rules={req}><Select options={toOptions(STRING_PATTERN_LABEL)} /></Form.Item>
          <Form.Item name="stiffnessRA" label="Độ cứng RA"><InputNumber min={0} className="!w-full" /></Form.Item>
          <Form.Item name="swingWeight" label="Swingweight"><InputNumber min={0} className="!w-full" /></Form.Item>
          <Form.Item name="beamWidthMm" label="Độ dày khung (mm)"><Input placeholder="21/23/21" /></Form.Item>
        </div>
        <Form.Item name="description" label="Mô tả" rules={req}><Input.TextArea rows={3} /></Form.Item>

        {isNew && (
          <>
            <Divider>Cây vợt đầu tiên</Divider>
            <div className="grid gap-x-4 sm:grid-cols-3">
              <Form.Item name={['variant', 'internalCode']} label="Mã nội bộ" rules={req}><Input placeholder="VC-0001" /></Form.Item>
              <Form.Item name={['variant', 'gripSize']} label="Grip" rules={req}>
                <Select options={GRIPS.map((g) => ({ value: g, label: GRIP_LABEL(g) }))} />
              </Form.Item>
              <Form.Item name={['variant', 'condition']} label="Tình trạng" rules={req}>
                <Select options={toOptions(CONDITION_LABEL)} />
              </Form.Item>
              <Form.Item name={['variant', 'price']} label="Giá bán" rules={req}><InputNumber min={0} step={10000} className="!w-full" /></Form.Item>
              <Form.Item name={['variant', 'originalPrice']} label="Giá gốc"><InputNumber min={0} step={10000} className="!w-full" /></Form.Item>
              <Form.Item name={['variant', 'costPrice']} label="Giá vốn"><InputNumber min={0} step={10000} className="!w-full" /></Form.Item>
            </div>
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => (
                <Form.Item
                  name={['variant', 'conditionNote']}
                  label="Mô tả tình trạng"
                  rules={[{ required: getFieldValue(['variant', 'condition']) !== 'NEW', message: 'Hàng cũ phải có mô tả tình trạng' }]}
                >
                  <Input.TextArea rows={2} />
                </Form.Item>
              )}
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
}

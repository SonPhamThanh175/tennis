'use client';

import { App, Divider, Form, Input, InputNumber, Modal, Select, Spin } from 'antd';
import { useEffect, useState } from 'react';
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
import type {
  AdminVariant,
  Balance,
  Brand,
  Category,
  Condition,
  GripSize,
  PlayStyle,
  SkillLevel,
  StringPattern,
} from '@/types/api';
import { ImageUploader } from './image-uploader';

interface FormValues {
  name: string;
  brandId: string;
  categoryId: string;
  level: SkillLevel;
  playStyle: PlayStyle;
  weightGrams: number;
  headSizeSqIn: number;
  balance: Balance;
  stringPattern: StringPattern;
  stiffnessRA?: number;
  swingWeight?: number;
  beamWidthMm?: string;
  description: string;
  internalCode: string;
  gripSize: GripSize;
  condition: Condition;
  conditionNote?: string;
  price: number;
  originalPrice?: number;
  costPrice?: number;
  images: string[];
}

const GRIPS: GripSize[] = ['G0', 'G1', 'G2', 'G3', 'G4', 'G5'];
const req = [{ required: true, message: 'Bắt buộc' }];

interface Props {
  /** id cây vợt cần sửa; null = thêm mới. */
  variantId: string | null;
  brands: Brand[];
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

/** Khi sửa: gọi API lấy chi tiết cây vợt rồi mới dựng form để đổ dữ liệu. */
export function RacquetFormModal({ variantId, ...rest }: Props) {
  const { token } = useAuth();
  const { message } = App.useApp();
  const [detail, setDetail] = useState<AdminVariant | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!variantId) return;
    let cancelled = false;
    adminApi
      .variant(token!, variantId)
      .then((d) => !cancelled && setDetail(d))
      .catch((e) => {
        if (cancelled) return;
        setFailed(true);
        message.error(e instanceof Error ? e.message : 'Không tải được thông tin cây vợt');
      });
    return () => {
      cancelled = true;
    };
  }, [variantId, token, message]);

  if (variantId && !detail) {
    return (
      <Modal open title="Sửa cây vợt" footer={null} onCancel={rest.onClose}>
        <div className="flex justify-center py-10">
          {failed ? 'Không tải được dữ liệu' : <Spin />}
        </div>
      </Modal>
    );
  }
  return <RacquetForm racquet={detail} {...rest} />;
}

function RacquetForm({
  racquet,
  brands,
  categories,
  onClose,
  onSaved,
}: Omit<Props, 'variantId'> & { racquet: AdminVariant | null }) {
  const { token } = useAuth();
  const { message } = App.useApp();
  const [form] = Form.useForm<FormValues>();
  const [saving, setSaving] = useState(false);
  const isNew = !racquet;

  async function submit() {
    const v = await form.validateFields();
    const variant = {
      internalCode: v.internalCode.trim(),
      gripSize: v.gripSize,
      condition: v.condition,
      conditionNote: v.conditionNote?.trim() || undefined,
      price: v.price,
      originalPrice: v.originalPrice,
      costPrice: v.costPrice,
      images: v.images ?? [],
    };
    const spec = {
      name: v.name,
      brandId: v.brandId,
      categoryId: v.categoryId,
      level: v.level,
      playStyle: v.playStyle,
      weightGrams: v.weightGrams,
      headSizeSqIn: v.headSizeSqIn,
      balance: v.balance,
      stringPattern: v.stringPattern,
      stiffnessRA: v.stiffnessRA,
      swingWeight: v.swingWeight,
      beamWidthMm: v.beamWidthMm,
      description: v.description,
    };

    setSaving(true);
    try {
      if (racquet) {
        await adminApi.updateProduct(token!, racquet.product.id, spec);
        await adminApi.updateVariant(token!, racquet.id, variant);
      } else {
        await adminApi.createProduct(token!, {
          ...spec,
          slug: slugify(`${v.name} ${variant.internalCode}`),
          images: [],
          variants: [{ ...variant, stock: 1 }],
        });
      }
      message.success('Đã lưu cây vợt');
      onSaved();
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Không thể lưu');
    } finally {
      setSaving(false);
    }
  }

  const initial = racquet
    ? {
        ...racquet.product,
        brandId: racquet.product.brandId,
        categoryId: racquet.product.categoryId,
        internalCode: racquet.internalCode,
        gripSize: racquet.gripSize,
        condition: racquet.condition,
        conditionNote: racquet.conditionNote ?? undefined,
        price: racquet.price,
        originalPrice: racquet.originalPrice ?? undefined,
        costPrice: racquet.costPrice ?? undefined,
        images: racquet.images,
      }
    : { weightGrams: 300, headSizeSqIn: 100, condition: 'GOOD', gripSize: 'G2', images: [] };

  return (
    <Modal
      open
      width={800}
      title={isNew ? 'Thêm vợt cũ' : `Sửa ${racquet.internalCode} · ${racquet.product.name}`}
      okText="Lưu"
      cancelText="Hủy"
      confirmLoading={saving}
      onOk={submit}
      onCancel={onClose}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" initialValues={initial}>
        <Divider titlePlacement="start">Ảnh thực tế</Divider>
        <Form.Item name="images">
          <ImageUploader />
        </Form.Item>

        <Divider titlePlacement="start">Cây vợt</Divider>
        <div className="grid gap-x-4 sm:grid-cols-3">
          <Form.Item name="internalCode" label="Mã nội bộ" rules={req}>
            <Input placeholder="VC-0001" />
          </Form.Item>
          <Form.Item name="gripSize" label="Grip" rules={req}>
            <Select options={GRIPS.map((g) => ({ value: g, label: GRIP_LABEL(g) }))} />
          </Form.Item>
          <Form.Item name="condition" label="Tình trạng" rules={req}>
            <Select options={toOptions(CONDITION_LABEL)} />
          </Form.Item>
          <Form.Item name="price" label="Giá bán" rules={req}>
            <InputNumber min={0} step={10000} className="!w-full" />
          </Form.Item>
          <Form.Item name="originalPrice" label="Giá gốc">
            <InputNumber min={0} step={10000} className="!w-full" />
          </Form.Item>
          <Form.Item name="costPrice" label="Giá vốn">
            <InputNumber min={0} step={10000} className="!w-full" />
          </Form.Item>
        </div>
        <Form.Item noStyle shouldUpdate={(a, b) => a.condition !== b.condition}>
          {({ getFieldValue }) => (
            <Form.Item
              name="conditionNote"
              label="Mô tả tình trạng"
              rules={[{ required: getFieldValue('condition') !== 'NEW', message: 'Hàng cũ phải có mô tả tình trạng' }]}
            >
              <Input.TextArea rows={2} placeholder="VD: Sơn trầy nhẹ khung, grip mới thay" />
            </Form.Item>
          )}
        </Form.Item>

        <Divider titlePlacement="start">Thông số kỹ thuật</Divider>
        <div className="grid gap-x-4 sm:grid-cols-2">
          <Form.Item name="name" label="Tên vợt" rules={req}>
            <Input placeholder="Pro Staff 97 v14" />
          </Form.Item>
          <Form.Item name="brandId" label="Thương hiệu" rules={req}>
            <Select options={brands.map((b) => ({ value: b.id, label: b.name }))} />
          </Form.Item>
          <Form.Item name="categoryId" label="Danh mục" rules={req}>
            <Select options={categories.map((c) => ({ value: c.id, label: c.name }))} />
          </Form.Item>
          <Form.Item name="level" label="Trình độ" rules={req}>
            <Select options={toOptions(LEVEL_LABEL)} />
          </Form.Item>
          <Form.Item name="playStyle" label="Lối chơi" rules={req}>
            <Select options={toOptions(PLAY_STYLE_LABEL)} />
          </Form.Item>
          <Form.Item name="balance" label="Cân bằng" rules={req}>
            <Select options={toOptions(BALANCE_LABEL)} />
          </Form.Item>
          <Form.Item name="weightGrams" label="Trọng lượng (g)" rules={req}>
            <InputNumber min={200} max={400} className="!w-full" />
          </Form.Item>
          <Form.Item name="headSizeSqIn" label="Mặt vợt (in²)" rules={req}>
            <InputNumber min={80} max={120} className="!w-full" />
          </Form.Item>
          <Form.Item name="stringPattern" label="Mắt cước" rules={req}>
            <Select options={toOptions(STRING_PATTERN_LABEL)} />
          </Form.Item>
          <Form.Item name="stiffnessRA" label="Độ cứng RA">
            <InputNumber min={0} className="!w-full" />
          </Form.Item>
          <Form.Item name="swingWeight" label="Swingweight">
            <InputNumber min={0} className="!w-full" />
          </Form.Item>
          <Form.Item name="beamWidthMm" label="Độ dày khung (mm)">
            <Input placeholder="21/23/21" />
          </Form.Item>
        </div>
        <Form.Item name="description" label="Mô tả" rules={req}>
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
}

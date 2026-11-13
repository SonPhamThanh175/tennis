'use client';

import { PlusOutlined } from '@ant-design/icons';
import { App, Upload } from 'antd';
import type { UploadFile } from 'antd';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';

const MAX_MB = 5;

interface Props {
  value?: string[];
  onChange?: (urls: string[]) => void;
  max?: number;
}

/** Ô tải ảnh dùng được trực tiếp trong Form.Item: giá trị là mảng URL ảnh đã upload. */
export function ImageUploader({ value = [], onChange, max = 6 }: Props) {
  const { token } = useAuth();
  const { message } = App.useApp();

  const fileList: UploadFile[] = value.map((url, i) => ({
    uid: `${i}-${url}`,
    name: url.split('/').pop() ?? 'image',
    status: 'done',
    url,
  }));

  return (
    <Upload
      listType="picture-card"
      accept="image/jpeg,image/png,image/webp"
      fileList={fileList}
      multiple
      beforeUpload={(file) => {
        if (file.size > MAX_MB * 1024 * 1024) {
          message.error(`Ảnh tối đa ${MAX_MB}MB`);
          return Upload.LIST_IGNORE;
        }
        return true;
      }}
      customRequest={async ({ file, onSuccess, onError }) => {
        try {
          const { url } = await adminApi.uploadImage(token!, file as File);
          onChange?.([...value, url]);
          onSuccess?.(url);
        } catch (e) {
          message.error(e instanceof Error ? e.message : 'Tải ảnh thất bại');
          onError?.(e as Error);
        }
      }}
      onRemove={(f) => onChange?.(value.filter((u) => u !== f.url))}
    >
      {value.length < max && (
        <div className="text-sm text-neutral-500">
          <PlusOutlined />
          <div className="mt-1">Thêm ảnh</div>
        </div>
      )}
    </Upload>
  );
}

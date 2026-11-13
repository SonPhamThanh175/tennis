'use client';

import { PlusOutlined } from '@ant-design/icons';
import { App, Upload } from 'antd';
import type { UploadFile } from 'antd';
import { useRef, useState } from 'react';
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
  // Không đọc `value` lúc nhiều file upload song song: mỗi request giữ closure cũ nên chỉ còn 1 ảnh.
  const urlsRef = useRef<string[]>(value);
  const [, rerender] = useState(0);
  if (urlsRef.current.length === 0 && value.length > 0) urlsRef.current = value;

  const urls = urlsRef.current;
  const fileList: UploadFile[] = urls.map((url, i) => ({
    uid: `${i}-${url}`,
    name: url.split('/').pop() ?? 'image',
    status: 'done',
    url,
  }));

  function commit(next: string[]) {
    urlsRef.current = next;
    onChange?.(next);
    rerender((n) => n + 1);
  }

  return (
    <Upload
      listType="picture-card"
      accept="image/jpeg,image/png,image/webp"
      fileList={fileList}
      multiple
      maxCount={max}
      beforeUpload={(file) => {
        if (file.size > MAX_MB * 1024 * 1024) {
          message.error(`Ảnh tối đa ${MAX_MB}MB`);
          return Upload.LIST_IGNORE;
        }
        if (urlsRef.current.length >= max) {
          message.error(`Tối đa ${max} ảnh`);
          return Upload.LIST_IGNORE;
        }
        return true;
      }}
      customRequest={async ({ file, onSuccess, onError }) => {
        try {
          const { url } = await adminApi.uploadImage(token!, file as File);
          commit([...urlsRef.current, url]);
          onSuccess?.(url);
        } catch (e) {
          message.error(e instanceof Error ? e.message : 'Tải ảnh thất bại');
          onError?.(e as Error);
        }
      }}
      onRemove={(f) => {
        commit(urlsRef.current.filter((u) => u !== f.url));
      }}
    >
      {urls.length < max && (
        <div className="text-sm text-neutral-500">
          <PlusOutlined />
          <div className="mt-1">Thêm ảnh</div>
        </div>
      )}
    </Upload>
  );
}

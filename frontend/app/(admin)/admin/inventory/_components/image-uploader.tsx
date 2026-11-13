'use client';

import { PlusOutlined } from '@ant-design/icons';
import { App, Upload } from 'antd';
import { useRef, useState } from 'react';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';

const MAX_MB = 5;

interface Props {
  value?: string[];
  onChange?: (urls: string[]) => void;
  max?: number;
}

/** Ô tải ảnh dùng được trực tiếp trong Form.Item: giá trị là mảng URL ảnh đã upload. Ảnh đầu là ảnh chính. */
export function ImageUploader({ value = [], onChange, max = 20 }: Props) {
  const { token } = useAuth();
  const { message } = App.useApp();
  // Không đọc `value` lúc nhiều file upload song song: mỗi request giữ closure cũ nên chỉ còn 1 ảnh.
  const urlsRef = useRef<string[]>(value);
  const dragFrom = useRef<number | null>(null);
  const [, rerender] = useState(0);
  if (urlsRef.current.length === 0 && value.length > 0) urlsRef.current = value;

  const urls = urlsRef.current;

  function commit(next: string[]) {
    urlsRef.current = next;
    onChange?.(next);
    rerender((n) => n + 1);
  }

  function move(from: number, to: number) {
    if (from === to || from < 0 || to < 0) return;
    const next = [...urlsRef.current];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    commit(next);
  }

  return (
    <div>
      <p className="mb-2 text-xs text-neutral-500">
        Kéo ảnh để đổi thứ tự. Ảnh đầu tiên là ảnh chính trên cửa hàng.
      </p>
      <div className="flex flex-wrap gap-2">
        {urls.map((url, i) => (
          <div
            key={url}
            draggable
            onDragStart={(e) => {
              dragFrom.current = i;
              e.dataTransfer.effectAllowed = 'move';
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }}
            onDrop={(e) => {
              e.preventDefault();
              const from = dragFrom.current;
              dragFrom.current = null;
              if (from == null) return;
              move(from, i);
            }}
            className={`relative h-24 w-24 cursor-grab overflow-hidden border bg-paper active:cursor-grabbing ${i === 0 ? 'border-black' : 'border-neutral-200'}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Ảnh ${i + 1}`} className="h-full w-full object-cover pointer-events-none" />
            <span className="absolute left-1 top-1 bg-black px-1 text-[10px] font-semibold uppercase text-white">
              {i === 0 ? 'Ảnh chính' : i + 1}
            </span>
            {i !== 0 && (
              <button
                type="button"
                onClick={() => move(i, 0)}
                className="absolute bottom-1 left-1 bg-white/90 px-1 text-[10px] font-medium"
              >
                Lên đầu
              </button>
            )}
            <button
              type="button"
              aria-label={`Xóa ảnh ${i + 1}`}
              onClick={() => commit(urlsRef.current.filter((u) => u !== url))}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center bg-white/90 text-xs leading-none"
            >
              ×
            </button>
          </div>
        ))}
        {urls.length < max && (
          <Upload
            accept="image/jpeg,image/png,image/webp"
            showUploadList={false}
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
          >
            <button
              type="button"
              className="flex h-24 w-24 flex-col items-center justify-center border border-dashed border-neutral-300 text-sm text-neutral-500"
            >
              <PlusOutlined />
              <span className="mt-1">Thêm ảnh</span>
            </button>
          </Upload>
        )}
      </div>
    </div>
  );
}

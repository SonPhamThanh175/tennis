'use client';

import { LeftOutlined, PlusOutlined, RightOutlined } from '@ant-design/icons';
import { App } from 'antd';
import { useRef, useState } from 'react';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';

const MAX_MB = 5;
const MAX_DEFAULT = 20;

interface Props {
  value?: string[];
  onChange?: (urls: string[]) => void;
  max?: number;
}

/** Ô tải ảnh dùng trong Form.Item: mảng URL. Ảnh đầu là ảnh chính trên cửa hàng. */
export function ImageUploader({ value = [], onChange, max = MAX_DEFAULT }: Props) {
  const { token } = useAuth();
  const { message } = App.useApp();
  const urlsRef = useRef<string[]>(value);
  const dragFrom = useRef<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [, rerender] = useState(0);
  if (value.length > 0 && urlsRef.current.length === 0) urlsRef.current = value;

  const urls = urlsRef.current;
  const canAdd = urls.length < max && !busy;

  function commit(next: string[]) {
    urlsRef.current = next;
    onChange?.(next);
    rerender((n) => n + 1);
  }

  function move(from: number, to: number) {
    if (from === to || from < 0 || to < 0 || to >= urlsRef.current.length) return;
    const next = [...urlsRef.current];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    commit(next);
  }

  async function addFiles(list: FileList | null) {
    if (!list?.length || !token) return;
    const room = max - urlsRef.current.length;
    const files = [...list].slice(0, room);
    if (!files.length) {
      message.error(`Tối đa ${max} ảnh`);
      return;
    }
    setBusy(true);
    try {
      for (const file of files) {
        if (file.size > MAX_MB * 1024 * 1024) {
          message.error(`${file.name}: tối đa ${MAX_MB}MB`);
          continue;
        }
        const { url } = await adminApi.uploadImage(token, file);
        commit([...urlsRef.current, url]);
      }
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Tải ảnh thất bại');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <p className="mb-2 text-sm text-neutral-600">
        Ảnh số 1 là ảnh chính. Dùng mũi tên để đổi chỗ, hoặc kéo thả.
      </p>
      <div className="flex flex-wrap gap-3">
        <label
          className={`flex h-[148px] w-28 cursor-pointer flex-col items-center justify-center border border-dashed text-sm ${
            canAdd ? 'border-neutral-400 text-neutral-700 hover:border-black' : 'cursor-not-allowed border-neutral-200 text-neutral-400'
          }`}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={!canAdd}
            className="sr-only"
            onChange={(e) => {
              void addFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <PlusOutlined className="text-lg" />
          <span className="mt-1 font-medium">{busy ? 'Đang tải…' : 'Thêm ảnh'}</span>
          <span className="mt-0.5 text-[11px] text-neutral-400">
            {urls.length}/{max}
          </span>
        </label>

        {urls.map((url, i) => (
          <div
            key={`${i}-${url}`}
            draggable
            onDragStart={(e) => {
              dragFrom.current = i;
              e.dataTransfer.effectAllowed = 'move';
              e.dataTransfer.setData('text/plain', String(i));
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }}
            onDrop={(e) => {
              e.preventDefault();
              const from = dragFrom.current ?? Number(e.dataTransfer.getData('text/plain'));
              dragFrom.current = null;
              if (Number.isNaN(from)) return;
              move(from, i);
            }}
            className={`flex w-28 flex-col border bg-white ${i === 0 ? 'border-black' : 'border-neutral-200'}`}
          >
            <div className="relative h-20 w-full cursor-grab overflow-hidden bg-paper active:cursor-grabbing">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Ảnh ${i + 1}`} className="h-full w-full object-cover pointer-events-none" />
              <span className="absolute left-1 top-1 bg-black px-1 text-[10px] font-semibold uppercase text-white">
                {i === 0 ? 'Ảnh chính' : `Ảnh ${i + 1}`}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-100 px-1 py-0.5">
              <button
                type="button"
                aria-label="Đổi sang trái"
                disabled={i === 0}
                onClick={() => move(i, i - 1)}
                className="grid h-7 w-7 place-items-center disabled:text-neutral-300"
              >
                <LeftOutlined />
              </button>
              <button
                type="button"
                aria-label="Đổi sang phải"
                disabled={i === urls.length - 1}
                onClick={() => move(i, i + 1)}
                className="grid h-7 w-7 place-items-center disabled:text-neutral-300"
              >
                <RightOutlined />
              </button>
            </div>
            {i !== 0 ? (
              <button
                type="button"
                onClick={() => move(i, 0)}
                className="border-t border-neutral-100 py-1 text-[11px] font-medium hover:bg-neutral-50"
              >
                Đặt làm ảnh chính
              </button>
            ) : (
              <span className="border-t border-neutral-100 py-1 text-center text-[11px] text-neutral-400">
                Hiển thị đầu tiên
              </span>
            )}
            <button
              type="button"
              onClick={() => commit(urlsRef.current.filter((_, idx) => idx !== i))}
              className="border-t border-neutral-100 py-1 text-[11px] text-red-600 hover:bg-red-50"
            >
              Xóa
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

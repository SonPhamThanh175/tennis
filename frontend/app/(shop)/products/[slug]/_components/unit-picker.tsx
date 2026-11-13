'use client';

import { App, Tag } from 'antd';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/states';
import { CONDITION_LABEL, CONDITION_TAG_COLOR, formatVnd, GRIP_LABEL } from '@/lib/format';
import { useAuth } from '@/providers/auth-provider';
import { useCart } from '@/providers/cart-provider';
import type { Variant } from '@/types/api';

/** Chọn từng cây vợt cụ thể (mỗi cây có mã, tình trạng, giá riêng). */
export function UnitPicker({ variants }: { variants: Variant[] }) {
  const available = variants.filter((v) => v.stock > 0);
  const [selectedId, setSelectedId] = useState(available[0]?.id);
  const [busy, setBusy] = useState(false);
  const { user } = useAuth();
  const { add } = useCart();
  const { message } = App.useApp();
  const selected = available.find((v) => v.id === selectedId);

  if (available.length === 0) return <EmptyState message="Mẫu này đã bán hết." />;

  async function onAdd() {
    if (!selected) return;
    setBusy(true);
    try {
      await add(selected.id, 1);
      message.success('Đã thêm vào giỏ hàng');
    } catch (e) {
      message.error(e instanceof Error ? e.message : 'Không thể thêm vào giỏ');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <h2 className="display text-2xl">Chọn cây vợt ({available.length})</h2>
      <ul className="space-y-2">
        {available.map((v) => (
          <li key={v.id}>
            <button
              type="button"
              onClick={() => setSelectedId(v.id)}
              className={`flex w-full items-center justify-between border px-4 py-3 text-left ${
                v.id === selectedId ? 'border-ink bg-paper' : 'border-neutral-300 hover:border-ink'
              }`}
            >
              <span>
                <span className="font-mono text-xs text-neutral-500">{v.internalCode}</span>
                <span className="mt-0.5 block text-sm">
                  Grip {GRIP_LABEL(v.gripSize)}{' '}
                  <Tag color={CONDITION_TAG_COLOR[v.condition]} className="!ml-2">
                    {CONDITION_LABEL[v.condition]}
                  </Tag>
                </span>
              </span>
              <span className="font-semibold">{formatVnd(v.price)}</span>
            </button>
          </li>
        ))}
      </ul>

      {selected?.conditionNote && (
        <p className="border border-neutral-200 bg-paper px-4 py-3 text-sm text-neutral-700">
          <span className="font-semibold">Tình trạng thực tế: </span>
          {selected.conditionNote}
        </p>
      )}

      {user ? (
        <Button block loading={busy} onClick={onAdd}>
          Thêm vào giỏ · {selected && formatVnd(selected.price)}
        </Button>
      ) : (
        <Link href="/login" className="block">
          <Button block>Đăng nhập để mua</Button>
        </Link>
      )}
      <p className="text-xs text-neutral-500">Đã kiểm định · Đổi trả trong 7 ngày · Mỗi cây chỉ có 1 chiếc</p>
    </div>
  );
}

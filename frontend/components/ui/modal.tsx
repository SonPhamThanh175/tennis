'use client';

import { useEffect } from 'react';
import { Button } from './button';

export function Modal({
  open,
  title,
  children,
  onClose,
  onOk,
  okText = 'Lưu',
  cancelText = 'Hủy',
  confirmLoading,
  footer,
  width = 640,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onOk?: () => void;
  okText?: string;
  cancelText?: string;
  confirmLoading?: boolean;
  footer?: React.ReactNode | null;
  width?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/50 p-4 md:items-center">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Đóng" onClick={onClose} />
      <div
        role="dialog"
        aria-modal
        aria-labelledby="dialog-title"
        className="relative z-10 my-8 w-full bg-white shadow-2xl"
        style={{ maxWidth: width }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4">
          <h2 id="dialog-title" className="display text-2xl">
            {title}
          </h2>
          <button type="button" className="text-xl leading-none text-neutral-400 hover:text-ink" onClick={onClose} aria-label="Đóng">
            ×
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer === null ? null : (
          <div className="flex justify-end gap-2 border-t border-neutral-200 px-5 py-3">
            {footer ?? (
              <>
                <Button type="button" variant="ghost" onClick={onClose}>
                  {cancelText}
                </Button>
                {onOk && (
                  <Button type="button" loading={confirmLoading} onClick={onOk}>
                    {okText}
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

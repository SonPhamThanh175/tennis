'use client';

import { RacquetMark } from '@/components/ui/racquet-mark';

export function Spinner({ label = 'Đang tải...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-neutral-500">
      <span className="relative h-10 w-10">
        <span className="absolute inset-0 rounded-full border-2 border-neutral-200" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-brand" />
      </span>
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="border border-brand/30 bg-brand/5 px-4 py-3 text-sm text-brand" role="alert">
      {message}
    </div>
  );
}

export function EmptyState({ message, action }: { message: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <RacquetMark className="h-16 w-12" muted />
      <p className="mt-4 text-neutral-600">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

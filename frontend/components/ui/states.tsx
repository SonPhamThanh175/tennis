'use client';

import { Alert, Empty, Spin } from 'antd';

export function Spinner({ label = 'Đang tải...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-neutral-500">
      <Spin size="large" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return <Alert type="error" showIcon title={message} />;
}

export function EmptyState({ message, action }: { message: string; action?: React.ReactNode }) {
  return (
    <Empty description={message} className="py-16">
      {action}
    </Empty>
  );
}

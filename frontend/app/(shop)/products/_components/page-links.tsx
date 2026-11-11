'use client';

import { Pagination } from 'antd';
import { useRouter } from 'next/navigation';
import { buildHref, type ProductParams } from './filters';

export function PageLinks({
  current,
  page,
  total,
  pageSize,
}: {
  current: ProductParams;
  page: number;
  total: number;
  pageSize: number;
}) {
  const router = useRouter();
  if (total <= pageSize) return null;
  return (
    <div className="mt-10 flex justify-center">
      <Pagination
        current={page}
        total={total}
        pageSize={pageSize}
        showSizeChanger={false}
        onChange={(p) => router.push(buildHref(current, { page: String(p) }))}
      />
    </div>
  );
}

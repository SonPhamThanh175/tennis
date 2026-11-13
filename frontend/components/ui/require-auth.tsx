'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { EmptyState, Spinner } from '@/components/ui/states';
import { useAuth } from '@/providers/auth-provider';
import type { Role } from '@/types/api';

/** Bọc các trang cần đăng nhập (và tùy chọn cần quyền ADMIN). */
export function RequireAuth({ role, children }: { role?: Role; children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace('/login');
  }, [ready, user, router]);

  if (!ready || !user) return <Spinner />;
  if (role && user.role !== role) {
    return (
      <EmptyState
        message="Bạn không có quyền truy cập trang này."
        action={
          <Link href="/" className="text-sm font-semibold uppercase text-brand hover:underline">
            Về trang chủ
          </Link>
        }
      />
    );
  }
  return <>{children}</>;
}

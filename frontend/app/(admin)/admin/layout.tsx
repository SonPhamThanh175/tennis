import { Suspense } from 'react';
import { RequireAuth } from '@/components/ui/require-auth';
import { Spinner } from '@/components/ui/states';
import { AdminShell } from './_components/admin-shell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Spinner />}>
      <RequireAuth role="ADMIN">
        <AdminShell>{children}</AdminShell>
      </RequireAuth>
    </Suspense>
  );
}

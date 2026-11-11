'use client';

import { AntdProvider } from './antd-provider';
import { AuthProvider } from './auth-provider';
import { CartProvider } from './cart-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AntdProvider>
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </AntdProvider>
  );
}

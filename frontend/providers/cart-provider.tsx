'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cartApi } from '@/lib/api';
import type { Cart } from '@/types/api';
import { useAuth } from './auth-provider';

interface CartState {
  cart: Cart | null;
  count: number;
  add: (variantId: string, quantity: number) => Promise<void>;
  update: (itemId: string, quantity: number) => Promise<void>;
  remove: (itemId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);

  const refresh = useCallback(async () => {
    setCart(token ? await cartApi.get(token) : null);
  }, [token]);

  useEffect(() => {
    refresh().catch(() => setCart(null));
  }, [refresh]);

  const value = useMemo<CartState>(() => {
    const need = () => {
      if (!token) throw new Error('Vui lòng đăng nhập để dùng giỏ hàng');
      return token;
    };
    return {
      cart,
      count: cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0,
      add: async (variantId, quantity) => setCart(await cartApi.add(need(), variantId, quantity)),
      update: async (itemId, quantity) => setCart(await cartApi.update(need(), itemId, quantity)),
      remove: async (itemId) => setCart(await cartApi.remove(need(), itemId)),
      refresh,
    };
  }, [cart, token, refresh]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart phải nằm trong CartProvider');
  return ctx;
}

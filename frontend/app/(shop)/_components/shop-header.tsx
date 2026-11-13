'use client';

import { MenuOutlined, ShoppingOutlined, UserOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import Link from 'next/link';
import { Drawer } from '@/components/ui/drawer';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useCart } from '@/providers/cart-provider';

const NAV = [
  { href: '/products', label: 'Vợt tennis' },
  { href: '/products?condition=LIKE_NEW', label: 'Lướt như mới' },
  { href: '/products?level=BEGINNER', label: 'Cho người mới' },
  { href: '/products?level=ADVANCED', label: 'Nâng cao' },
];

export function ShopHeader() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const items = [
    ...(user?.role === 'ADMIN' ? [{ key: 'admin', label: 'Trang quản trị', onClick: () => router.push('/admin') }] : []),
    { key: 'orders', label: 'Đơn hàng của tôi', onClick: () => router.push('/orders') },
    {
      key: 'logout',
      label: 'Đăng xuất',
      onClick: () => {
        logout();
        router.push('/');
      },
    },
  ];

  function go(href: string) {
    setMenuOpen(false);
    router.push(href);
  }

  return (
    <header className="sticky top-0 z-50 bg-ink text-white">
      <div className="bg-brand px-3 py-1.5 text-center text-[11px] font-semibold leading-snug tracking-wide sm:text-xs">
        VỢT CŨ ĐÃ KIỂM ĐỊNH · ĐỔI TRẢ TRONG 7 NGÀY
      </div>
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 md:h-16 md:gap-8">
        <Link href="/" className="display shrink-0 text-2xl tracking-wider md:text-3xl">
          Tennis<span className="text-brand">Shop</span>
        </Link>
        <nav className="hidden flex-1 gap-6 md:flex justify-center">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="text-sm font-semibold uppercase tracking-wide hover:text-brand">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-4 text-lg md:gap-5">
          {user ? (
            <Dropdown menu={{ items }} placement="bottomRight">
              <button className="flex items-center gap-2 text-sm font-semibold">
                <UserOutlined /> <span className="hidden sm:inline">{user.fullName}</span>
              </button>
            </Dropdown>
          ) : (
            <Link href="/login" className="hidden text-sm font-semibold uppercase hover:text-brand sm:inline">
              Đăng nhập
            </Link>
          )}
          <Link
            href="/cart"
            aria-label="Giỏ hàng"
            className="relative inline-flex h-9 w-9 items-center justify-center"
          >
            <ShoppingOutlined className="!text-xl !text-white" />
            {count > 0 && (
              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold leading-none text-white">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center md:hidden"
            aria-label="Mở menu"
            onClick={() => setMenuOpen(true)}
          >
            <MenuOutlined className="!text-lg" />
          </button>
        </div>
      </div>
      <Drawer title="Menu" side="right" open={menuOpen} onClose={() => setMenuOpen(false)}>
        <nav className="flex flex-col gap-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded px-2 py-3 text-base font-semibold uppercase tracking-wide hover:bg-neutral-50"
              onClick={() => setMenuOpen(false)}
            >
              {n.label}
            </Link>
          ))}
          <hr className="my-2 border-neutral-200" />
          {user ? (
            <>
              {user.role === 'ADMIN' && (
                <Link href="/admin" className="rounded px-2 py-3 font-semibold" onClick={() => setMenuOpen(false)}>
                  Trang quản trị
                </Link>
              )}
              <Link href="/orders" className="rounded px-2 py-3 font-semibold" onClick={() => setMenuOpen(false)}>
                Đơn hàng của tôi
              </Link>
              <button
                type="button"
                className="rounded px-2 py-3 text-left font-semibold text-brand"
                onClick={() => {
                  logout();
                  go('/');
                }}
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <Link href="/login" className="rounded px-2 py-3 font-semibold" onClick={() => setMenuOpen(false)}>
              Đăng nhập
            </Link>
          )}
        </nav>
      </Drawer>
    </header>
  );
}

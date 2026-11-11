'use client';

import { ShoppingOutlined, UserOutlined } from '@ant-design/icons';
import { Badge, Dropdown } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

  return (
    <header className="sticky top-0 z-50 bg-ink text-white">
      <div className="bg-brand py-1.5 text-center text-xs font-semibold tracking-wide">
        VỢT CŨ ĐÃ KIỂM ĐỊNH · ĐỔI TRẢ TRONG 7 NGÀY
      </div>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4">
        <Link href="/" className="display text-3xl tracking-wider">
          Tennis<span className="text-brand">Shop</span>
        </Link>
        <nav className="hidden flex-1 gap-6 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="text-sm font-semibold uppercase tracking-wide hover:text-brand">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-5 text-lg">
          {user ? (
            <Dropdown menu={{ items }} placement="bottomRight">
              <button className="flex items-center gap-2 text-sm font-semibold">
                <UserOutlined /> <span className="hidden sm:inline">{user.fullName}</span>
              </button>
            </Dropdown>
          ) : (
            <Link href="/login" className="text-sm font-semibold uppercase hover:text-brand">
              Đăng nhập
            </Link>
          )}
          <Link href="/cart" aria-label="Giỏ hàng">
            <Badge count={count} size="small" color="#c8102e" offset={[2, 0]}>
              <ShoppingOutlined className="!text-xl !text-white" />
            </Badge>
          </Link>
        </div>
      </div>
    </header>
  );
}

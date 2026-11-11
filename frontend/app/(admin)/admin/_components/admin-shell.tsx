'use client';

import {
  DashboardOutlined,
  LogoutOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
  ThunderboltOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu } from 'antd';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';

const { Sider, Header, Content } = Layout;

const ITEMS = [
  { key: '/admin', icon: <DashboardOutlined />, label: <Link href="/admin">Tổng quan</Link> },
  { key: '/admin/inventory', icon: <InboxOutlined />, label: <Link href="/admin/inventory">Kho vợt cũ</Link> },
  { key: '/admin/models', icon: <ThunderboltOutlined />, label: <Link href="/admin/models">Mẫu vợt</Link> },
  { key: '/admin/taxonomy', icon: <TagsOutlined />, label: <Link href="/admin/taxonomy">Thương hiệu & danh mục</Link> },
  { key: '/admin/orders', icon: <ShoppingCartOutlined />, label: <Link href="/admin/orders">Đơn hàng</Link> },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const selected = ITEMS.filter((i) => i.key !== '/admin' && pathname.startsWith(i.key))[0]?.key ?? '/admin';

  return (
    <Layout className="!min-h-screen">
      <Sider theme="dark" width={230} breakpoint="lg" collapsedWidth={64} style={{ background: '#111' }}>
        <div className="display px-5 py-5 text-2xl text-white">
          Admin<span className="text-brand">.</span>
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[selected]} items={ITEMS} style={{ background: '#111' }} />
      </Sider>
      <Layout>
        <Header className="!flex items-center justify-between !bg-white !px-6 shadow-sm">
          <Link href="/" className="text-sm text-neutral-500 hover:text-brand">← Xem cửa hàng</Link>
          <div className="flex items-center gap-3 text-sm">
            <span>{user?.fullName}</span>
            <Button
              icon={<LogoutOutlined />}
              onClick={() => {
                logout();
                router.push('/login');
              }}
            >
              Đăng xuất
            </Button>
          </div>
        </Header>
        <Content className="p-6">{children}</Content>
      </Layout>
    </Layout>
  );
}

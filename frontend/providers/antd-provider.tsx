'use client';

import { App, ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: '#c8102e',
          colorLink: '#c8102e',
          colorText: '#111111',
          borderRadius: 4,
          fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
        },
        components: {
          Button: { fontWeight: 600, controlHeight: 40 },
          Menu: { itemSelectedBg: '#fdecee', itemSelectedColor: '#c8102e' },
        },
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
}

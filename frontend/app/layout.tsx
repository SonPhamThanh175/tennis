import { Suspense } from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import type { Metadata } from 'next';
import { Barlow_Condensed, Geist } from 'next/font/google';
import { Providers } from '@/providers';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin', 'vietnamese'],
});

const barlow = Barlow_Condensed({
  variable: '--font-display',
  weight: ['500', '600', '700', '800'],
  subsets: ['latin', 'vietnamese'],
});

export const metadata: Metadata = {
  title: 'Tennis Shop - Vợt tennis cũ kiểm định',
  description: 'Vợt tennis cũ tuyển chọn, kiểm định kỹ, bảo hành đổi trả 7 ngày.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="vi" className={`${geistSans.variable} ${barlow.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Suspense>
        <AntdRegistry>
          <Providers>{children}</Providers>
        </AntdRegistry>
        </Suspense>
      </body>
    </html>
  );
}

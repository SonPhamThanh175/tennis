import { ShopFooter } from './_components/shop-footer';
import { ShopHeader } from './_components/shop-header';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ShopHeader />
      <main className="flex-1">{children}</main>
      <ShopFooter />
    </>
  );
}

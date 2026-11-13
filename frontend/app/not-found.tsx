import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="display text-7xl text-brand">404</p>
      <h1 className="display mt-4 text-4xl">Không tìm thấy trang</h1>
      <p className="mt-3 text-neutral-600">Đường dẫn không tồn tại hoặc sản phẩm đã được ẩn khỏi cửa hàng.</p>
      <Link href="/products" className="mt-8 inline-block bg-brand px-8 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-brand-dark">
        Xem kho vợt
      </Link>
    </div>
  );
}

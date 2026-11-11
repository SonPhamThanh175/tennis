import Link from 'next/link';

export function ShopFooter() {
  return (
    <footer className="mt-16 bg-ink text-neutral-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <p className="display text-3xl text-white">
            Tennis<span className="text-brand">Shop</span>
          </p>
          <p className="mt-3 text-sm">Chuyên vợt tennis cũ tuyển chọn, kiểm định từng cây.</p>
        </div>
        <div>
          <h4 className="mb-3 font-semibold text-white">Mua sắm</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/products" className="hover:text-white">Tất cả vợt</Link></li>
            <li><Link href="/cart" className="hover:text-white">Giỏ hàng</Link></li>
            <li><Link href="/orders" className="hover:text-white">Đơn hàng</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold text-white">Cam kết</h4>
          <ul className="space-y-2 text-sm">
            <li>Kiểm định trước khi bán</li>
            <li>Đổi trả trong 7 ngày</li>
            <li>Mô tả đúng tình trạng thực tế</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold text-white">Liên hệ</h4>
          <p className="text-sm">Hotline: 0900 000 000</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-neutral-500">
        © 2026 TennisShop
      </div>
    </footer>
  );
}

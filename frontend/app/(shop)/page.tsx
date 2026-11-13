import Link from 'next/link';
import { Suspense } from 'react';
import { ErrorBox, Spinner } from '@/components/ui/states';
import { productsApi } from '@/lib/api';
import { RacquetCard } from './_components/racquet-card';

async function Featured() {
  let items;
  let brands;
  try {
    [{ items }, brands] = await Promise.all([productsApi.list({ limit: 8 }), productsApi.brands()]);
  } catch (e) {
    return <ErrorBox message={e instanceof Error ? e.message : 'Không tải được danh sách vợt.'} />;
  }
  return (
    <>
      <div className="mb-12 flex flex-wrap gap-3">
        {brands.map((b) => (
          <Link
            key={b.id}
            href={`/products?brand=${b.slug}`}
            className="display border border-ink px-6 py-3 text-xl hover:bg-ink hover:text-white"
          >
            {b.name}
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
        {items.map((p) => (
          <RacquetCard key={p.id} product={p} />
        ))}
      </div>
    </>
  );
}

const PROMISES = [
  { icon: '01', title: 'Kiểm định từng cây', text: 'Mỗi cây vợt có mã riêng và ghi chú tình trạng thực tế.' },
  { icon: '02', title: 'Đổi trả 7 ngày', text: 'Không đúng mô tả, đổi trả trong 7 ngày.' },
  { icon: '03', title: 'Thông số rõ ràng', text: 'Trọng lượng, mặt vợt, điểm cân bằng, mật độ dây.' },
];

export default function Home() {
  return (
    <>
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-7xl px-4 py-24 md:py-36">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-brand">Vợt tennis cũ tuyển chọn</p>
          <h1 className="display max-w-3xl text-6xl md:text-8xl">
            Chơi vợt xịn,
            <br />
            <span className="text-brand">giá hợp lý.</span>
          </h1>
          <p className="mt-6 max-w-xl text-neutral-300">
            Wilson, Babolat, Head, Yonex… đã qua kiểm định, mô tả đúng tình trạng, bảo đảm đổi trả.
          </p>
          <Link
            href="/products"
            className="display mt-10 inline-block bg-brand px-10 py-4 text-2xl text-white hover:bg-brand-dark"
          >
            Xem kho vợt
          </Link>
        </div>
      </section>

      <section className="border-b border-neutral-200">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 md:grid-cols-3">
          {PROMISES.map((p) => (
            <div key={p.title} className="flex gap-4">
              <span className="display text-4xl text-brand">{p.icon}</span>
              <div>
                <h3 className="font-semibold">{p.title}</h3>
                <p className="text-sm text-neutral-600">{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-14">
        <h2 className="display mb-8 text-5xl">Mới lên kệ</h2>
        <Suspense fallback={<Spinner />}>
          <Featured />
        </Suspense>
      </section>
    </>
  );
}

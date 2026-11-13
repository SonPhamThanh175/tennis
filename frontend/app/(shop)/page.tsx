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
      <section className="relative overflow-hidden text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-court.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[70%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/25" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-24 md:py-36">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand sm:mb-4 sm:text-sm sm:tracking-[0.3em]">
            Vợt tennis cũ tuyển chọn
          </p>
          <h1 className="display max-w-3xl text-4xl leading-tight sm:text-6xl md:text-8xl">
            Chơi vợt xịn,
            <br />
            <span className="text-brand">giá hợp lý.</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm text-neutral-200 sm:mt-6 sm:text-base">
            Wilson, Babolat, Head, Yonex… đã qua kiểm định, mô tả đúng tình trạng, bảo đảm đổi trả.
          </p>
          <Link
            href="/products"
            className="display mt-8 inline-block w-full bg-brand px-8 py-3.5 text-center text-xl text-white shadow-lg hover:bg-brand-dark sm:mt-10 sm:w-auto sm:px-10 sm:py-4 sm:text-2xl"
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

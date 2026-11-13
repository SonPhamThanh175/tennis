import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ErrorBox, Spinner } from '@/components/ui/states';
import { ApiError, productsApi } from '@/lib/api';
import { ImageGallery } from './_components/image-gallery';
import { RelatedRacquets } from './_components/related-racquets';
import { SpecMatrix } from './_components/spec-matrix';
import { UnitPicker } from './_components/unit-picker';

async function Detail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await productsApi.bySlug(slug).catch((e) => {
    if (e instanceof ApiError && e.status === 404) notFound();
    return null;
  });
  if (!product) {
    return <ErrorBox message="Không kết nối được máy chủ. Kiểm tra BACKEND_URL trên Vercel và backend Render đã chạy." />;
  }
  const images = [...new Set([...product.variants.flatMap((v) => v.images), ...product.images])];

  return (
    <>
      <div className="grid gap-12 md:grid-cols-2">
        <ImageGallery images={images} alt={product.name} />
        <div className="space-y-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand">{product.brand.name}</p>
            <h1 className="display mt-1 text-4xl md:text-5xl">{product.name}</h1>
            <p className="mt-4 text-neutral-700">{product.description}</p>
          </div>
          <UnitPicker variants={product.variants} />
          <SpecMatrix product={product} />
        </div>
      </div>
      <Suspense fallback={<Spinner />}>
        <RelatedRacquets slug={slug} />
      </Suspense>
    </>
  );
}

export default function ProductPage({ params }: PageProps<'/products/[slug]'>) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Suspense fallback={<Spinner />}>
        <Detail params={params} />
      </Suspense>
    </div>
  );
}

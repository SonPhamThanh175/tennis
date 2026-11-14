import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ErrorBox } from '@/components/ui/states';
import { ApiError, productsApi } from '@/lib/api';
import { RacquetCardSkeletonGrid } from '../../_components/racquet-card-skeleton';
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
      <Suspense
        fallback={
          <section className="mt-16 border-t border-neutral-200 pt-12">
            <div className="mb-8 h-10 w-56 animate-pulse bg-neutral-200" />
            <RacquetCardSkeletonGrid
              count={6}
              className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-6"
            />
          </section>
        }
      >
        <RelatedRacquets slug={slug} />
      </Suspense>
    </>
  );
}

function ProductDetailSkeleton() {
  return (
    <>
      <div className="grid gap-12 md:grid-cols-2">
        <div className="aspect-square animate-pulse bg-neutral-200" />
        <div className="space-y-4" aria-hidden>
          <div className="h-4 w-20 animate-pulse bg-neutral-200" />
          <div className="h-10 w-3/4 animate-pulse bg-neutral-200" />
          <div className="h-24 animate-pulse bg-neutral-100" />
          <div className="h-32 animate-pulse bg-neutral-100" />
        </div>
      </div>
      <section className="mt-16 border-t border-neutral-200 pt-12">
        <div className="mb-8 h-10 w-56 animate-pulse bg-neutral-200" />
        <RacquetCardSkeletonGrid
          count={6}
          className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-6"
        />
      </section>
    </>
  );
}

export default function ProductPage({ params }: PageProps<'/products/[slug]'>) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Suspense fallback={<ProductDetailSkeleton />}>
        <Detail params={params} />
      </Suspense>
    </div>
  );
}

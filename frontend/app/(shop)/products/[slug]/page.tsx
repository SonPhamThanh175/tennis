import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Spinner } from '@/components/ui/states';
import { ApiError, productsApi } from '@/lib/api';
import { SpecMatrix } from './_components/spec-matrix';
import { UnitPicker } from './_components/unit-picker';

async function Detail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await productsApi.bySlug(slug).catch((e) => {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  });
  const image = product.variants[0]?.images[0] ?? product.images[0];

  return (
    <div className="grid gap-12 md:grid-cols-2">
      <div className="aspect-square bg-paper">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-8xl text-neutral-300">🎾</div>
        )}
      </div>
      <div className="space-y-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">{product.brand.name}</p>
          <h1 className="display mt-1 text-5xl">{product.name}</h1>
          <p className="mt-4 text-neutral-700">{product.description}</p>
        </div>
        <UnitPicker variants={product.variants} />
        <SpecMatrix product={product} />
      </div>
    </div>
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

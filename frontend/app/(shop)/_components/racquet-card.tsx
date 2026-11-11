import { Tag } from 'antd';
import Link from 'next/link';
import { CONDITION_LABEL, CONDITION_TAG_COLOR, formatVnd, WEIGHT_CLASS_LABEL } from '@/lib/format';
import type { Product } from '@/types/api';

/** Thẻ vợt dùng chung cho trang chủ và danh sách sản phẩm. */
export function RacquetCard({ product }: { product: Product }) {
  const available = product.variants.filter((v) => v.stock > 0).sort((a, b) => a.price - b.price);
  const first = available[0];
  const image = first?.images[0] ?? product.images[0];

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden bg-paper">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={product.name} className="h-full w-full object-cover transition group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl text-neutral-300">🎾</div>
        )}
        {first && (
          <Tag color={CONDITION_TAG_COLOR[first.condition]} className="!absolute left-3 top-3 !m-0 font-semibold">
            {CONDITION_LABEL[first.condition]}
          </Tag>
        )}
        {available.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 font-bold uppercase">Đã bán hết</div>
        )}
      </div>
      <div className="pt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{product.brand.name}</p>
        <h3 className="display mt-1 text-xl group-hover:text-brand">{product.name}</h3>
        <p className="mt-1 text-xs text-neutral-500">
          {product.weightGrams}g · {product.headSizeSqIn} in² · {WEIGHT_CLASS_LABEL[product.weightClass].split(' (')[0]}
        </p>
        <p className="mt-2 font-semibold">
          {first ? (
            <>
              {available.length > 1 && <span className="text-xs font-normal text-neutral-500">Từ </span>}
              {formatVnd(first.price)}
              {first.originalPrice && (
                <span className="ml-2 text-sm font-normal text-neutral-400 line-through">{formatVnd(first.originalPrice)}</span>
              )}
            </>
          ) : (
            <span className="text-neutral-400">Hết hàng</span>
          )}
        </p>
        {available.length === 1 && <p className="text-xs font-semibold text-brand">Chỉ còn 1 cây duy nhất</p>}
      </div>
    </Link>
  );
}

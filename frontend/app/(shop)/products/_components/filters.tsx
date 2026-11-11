import Link from 'next/link';
import { CONDITION_LABEL, LEVEL_LABEL, PLAY_STYLE_LABEL } from '@/lib/format';
import type { Brand } from '@/types/api';

export type ProductParams = {
  q?: string;
  brand?: string;
  level?: string;
  condition?: string;
  playStyle?: string;
  page?: string;
};

export function buildHref(current: ProductParams, patch: ProductParams) {
  const merged = { ...current, ...patch };
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) if (v) qs.set(k, v);
  const s = qs.toString();
  return s ? `/products?${s}` : '/products';
}

function Group({
  title,
  param,
  current,
  options,
}: {
  title: string;
  param: keyof ProductParams;
  current: ProductParams;
  options: { value: string; label: string }[];
}) {
  const all = [{ value: '', label: 'Tất cả' }, ...options];
  return (
    <div>
      <h3 className="display mb-3 text-xl">{title}</h3>
      <ul className="space-y-1.5 text-sm">
        {all.map((o) => {
          const active = (current[param] ?? '') === o.value;
          return (
            <li key={o.value}>
              <Link
                href={buildHref(current, { [param]: o.value || undefined, page: undefined })}
                className={active ? 'font-bold text-brand' : 'text-neutral-700 hover:text-brand'}
              >
                {o.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const toOpts = (m: Record<string, string>) => Object.entries(m).map(([value, label]) => ({ value, label }));

export function Filters({ current, brands }: { current: ProductParams; brands: Brand[] }) {
  return (
    <aside className="space-y-8">
      <form action="/products">
        <input
          name="q"
          defaultValue={current.q}
          placeholder="Tìm vợt..."
          className="w-full border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-ink"
        />
      </form>
      <Group title="Thương hiệu" param="brand" current={current} options={brands.map((b) => ({ value: b.slug, label: b.name }))} />
      <Group title="Tình trạng" param="condition" current={current} options={toOpts(CONDITION_LABEL)} />
      <Group title="Trình độ" param="level" current={current} options={toOpts(LEVEL_LABEL)} />
      <Group title="Lối chơi" param="playStyle" current={current} options={toOpts(PLAY_STYLE_LABEL)} />
    </aside>
  );
}

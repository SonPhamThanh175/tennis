/**
 * Server (SSR trên Vercel): ưu tiên BACKEND_URL (URL Render, không cần public).
 * Trình duyệt: NEXT_PUBLIC_API_URL, hoặc `/backend` (rewrite cùng origin, tránh CORS).
 */
const PROD_API = 'https://tennis-api-o1df.onrender.com';

export function getApiBase(): string {
  const pub = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');
  const backend = process.env.BACKEND_URL?.replace(/\/+$/, '');
  if (typeof window === 'undefined') {
    return backend || pub || (process.env.NODE_ENV === 'production' ? PROD_API : 'http://localhost:4000');
  }
  return pub || (process.env.NODE_ENV === 'production' ? PROD_API : '/backend');
}

export const API_URL = getApiBase();

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
  query?: Record<string, string | number | undefined>;
}

function resolveUrl(path: string, query?: RequestOptions['query']): string {
  const base = getApiBase();
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v !== undefined && v !== '') qs.set(k, String(v));
  }
  const suffix = qs.size ? `${path}?${qs}` : path;
  if (base.startsWith('http://') || base.startsWith('https://')) {
    return new URL(suffix, `${base}/`).toString();
  }
  return `${base}${suffix.startsWith('/') ? suffix : `/${suffix}`}`;
}

function describeTarget(): string {
  try {
    const base = getApiBase();
    if (base.startsWith('http')) return new URL(base).host;
    return base;
  } catch {
    return getApiBase();
  }
}

/** Upload 1 file ảnh (multipart). Không set Content-Type để trình duyệt tự thêm boundary. */
export async function uploadFile(path: string, file: File, token: string): Promise<{ url: string }> {
  const form = new FormData();
  form.append('file', file);
  let res: Response;
  try {
    res = await fetch(resolveUrl(path), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
  } catch {
    throw new ApiError(0, `Không kết nối được máy chủ (${describeTarget()}).`);
  }
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new ApiError(res.status, (Array.isArray(data?.message) ? data.message.join(', ') : data?.message) ?? `Lỗi ${res.status}`);
  }
  return res.json();
}

/** Hàm gọi API duy nhất của toàn bộ frontend. Mọi module trong lib/api đều đi qua đây. */
export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const url = resolveUrl(path, opts.query);

  let res: Response;
  try {
    res = await fetch(url, {
      method: opts.method ?? 'GET',
      cache: 'no-store',
      signal: AbortSignal.timeout(12_000),
      headers: {
        ...(opts.body !== undefined && { 'Content-Type': 'application/json' }),
        ...(opts.token && { Authorization: `Bearer ${opts.token}` }),
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new ApiError(0, `Không kết nối được máy chủ (${describeTarget()}).`);
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const msg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
    throw new ApiError(res.status, msg ?? `Lỗi ${res.status}`);
  }
  return res.json() as Promise<T>;
}

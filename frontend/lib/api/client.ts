export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

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

/** Upload 1 file ảnh (multipart). Không set Content-Type để trình duyệt tự thêm boundary. */
export async function uploadFile(path: string, file: File, token: string): Promise<{ url: string }> {
  const form = new FormData();
  form.append('file', file);
  let res: Response;
  try {
    res = await fetch(new URL(path, API_URL), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
  } catch {
    throw new ApiError(0, 'Không kết nối được máy chủ. Hãy kiểm tra backend đã chạy chưa.');
  }
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new ApiError(res.status, (Array.isArray(data?.message) ? data.message.join(', ') : data?.message) ?? `Lỗi ${res.status}`);
  }
  return res.json();
}

/** Hàm gọi API duy nhất của toàn bộ frontend. Mọi module trong lib/api đều đi qua đây. */
export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const url = new URL(path, API_URL);
  for (const [k, v] of Object.entries(opts.query ?? {})) {
    if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: opts.method ?? 'GET',
      cache: 'no-store',
      headers: {
        ...(opts.body !== undefined && { 'Content-Type': 'application/json' }),
        ...(opts.token && { Authorization: `Bearer ${opts.token}` }),
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Không kết nối được máy chủ. Hãy kiểm tra backend đã chạy chưa.');
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const msg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
    throw new ApiError(res.status, msg ?? `Lỗi ${res.status}`);
  }
  return res.json() as Promise<T>;
}

import type {
  AdminStats,
  AdminVariant,
  AuthResponse,
  Brand,
  Cart,
  Category,
  CreateOrderInput,
  CreateProductInput,
  Order,
  OrderStatus,
  Paginated,
  Product,
  ProductQuery,
  TaxonomyItem,
  UpdateProductInput,
  UpdateVariantInput,
  User,
  Variant,
  VariantInput,
} from '@/types/api';
import { request, uploadFile } from './client';

export { ApiError } from './client';

export type TaxonomyKind = 'brands' | 'categories';

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } }),
  register: (body: { email: string; password: string; fullName: string; phone?: string }) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body }),
  me: (token: string) => request<User>('/auth/me', { token }),
};

export const productsApi = {
  list: (query: ProductQuery = {}) =>
    request<Paginated<Product>>('/products', { query: { ...query } }),
  bySlug: (slug: string) => request<Product>(`/products/${encodeURIComponent(slug)}`),
  related: (slug: string) => request<Product[]>(`/products/${encodeURIComponent(slug)}/related`),
  categories: () => request<Category[]>('/categories'),
  brands: () => request<Brand[]>('/brands'),
};

export const cartApi = {
  get: (token: string) => request<Cart>('/cart', { token }),
  add: (token: string, variantId: string, quantity: number) =>
    request<Cart>('/cart/items', { method: 'POST', token, body: { variantId, quantity } }),
  update: (token: string, itemId: string, quantity: number) =>
    request<Cart>(`/cart/items/${itemId}`, { method: 'PATCH', token, body: { quantity } }),
  remove: (token: string, itemId: string) =>
    request<Cart>(`/cart/items/${itemId}`, { method: 'DELETE', token }),
};

export const ordersApi = {
  create: (token: string, body: CreateOrderInput) =>
    request<Order>('/orders', { method: 'POST', token, body }),
  list: (token: string) => request<Order[]>('/orders', { token }),
  cancel: (token: string, id: string) =>
    request<Order>(`/orders/${id}/cancel`, { method: 'POST', token }),
};

export const adminApi = {
  stats: (token: string) => request<AdminStats>('/admin/stats', { token }),

  uploadImage: (token: string, file: File) => uploadFile('/admin/uploads', file, token),

  products: (token: string) => request<Product[]>('/admin/products', { token }),
  createProduct: (token: string, body: CreateProductInput) =>
    request<Product>('/admin/products', { method: 'POST', token, body }),
  updateProduct: (token: string, id: string, body: UpdateProductInput) =>
    request<Product>(`/admin/products/${id}`, { method: 'PATCH', token, body }),
  deactivateProduct: (token: string, id: string) =>
    request<Product>(`/admin/products/${id}`, { method: 'DELETE', token }),

  variant: (token: string, id: string) => request<AdminVariant>(`/admin/variants/${id}`, { token }),
  variants: (token: string, inStock?: boolean) =>
    request<AdminVariant[]>('/admin/variants', {
      token,
      query: { inStock: inStock === undefined ? undefined : String(inStock) },
    }),
  createVariant: (token: string, productId: string, body: VariantInput) =>
    request<Variant>(`/admin/products/${productId}/variants`, { method: 'POST', token, body }),
  updateVariant: (token: string, id: string, body: UpdateVariantInput) =>
    request<Variant>(`/admin/variants/${id}`, { method: 'PATCH', token, body }),
  deleteVariant: (token: string, id: string) =>
    request<{ ok: boolean }>(`/admin/variants/${id}`, { method: 'DELETE', token }),
  bulkDeleteVariants: (token: string, ids: string[]) =>
    request<{ deleted: number; hidden: number; missing: number }>('/admin/variants/bulk-delete', {
      method: 'POST',
      token,
      body: { ids },
    }),

  taxonomy: (token: string, kind: TaxonomyKind) =>
    request<TaxonomyItem[]>(`/admin/${kind}`, { token }),
  createTaxonomy: (token: string, kind: TaxonomyKind, body: { name: string; slug: string }) =>
    request<TaxonomyItem>(`/admin/${kind}`, { method: 'POST', token, body }),
  updateTaxonomy: (
    token: string,
    kind: TaxonomyKind,
    id: string,
    body: { name?: string; slug?: string; isActive?: boolean },
  ) => request<TaxonomyItem>(`/admin/${kind}/${id}`, { method: 'PATCH', token, body }),
  deleteTaxonomy: (token: string, kind: TaxonomyKind, id: string) =>
    request<TaxonomyItem>(`/admin/${kind}/${id}`, { method: 'DELETE', token }),

  orders: (token: string, status?: OrderStatus) =>
    request<Order[]>('/admin/orders', { token, query: { status } }),
  setOrderStatus: (token: string, id: string, status: OrderStatus) =>
    request<Order>(`/admin/orders/${id}/status`, { method: 'PATCH', token, body: { status } }),
};

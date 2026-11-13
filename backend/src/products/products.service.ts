import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { slugify } from '../common/racquet.js';
import { ListProductsQuery } from './products.dto.js';

/** API công khai không bao giờ trả costPrice (giá nhập). */
export const publicVariantSelect = {
  id: true,
  productId: true,
  internalCode: true,
  gripSize: true,
  condition: true,
  conditionNote: true,
  images: true,
  price: true,
  originalPrice: true,
  stock: true,
} as const;

export const publicProductInclude = {
  category: true,
  brand: true,
  variants: {
    select: publicVariantSelect,
    orderBy: { price: 'asc' },
  },
} as const;

@Injectable()
export class ProductsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async list(q: ListProductsQuery) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 12;

    // Mỗi điều kiện lọc cây vợt phải khớp trên cùng một variant còn hàng.
    const variantFilter: Prisma.ProductVariantWhereInput = {
      stock: { gt: 0 },
      ...(q.condition && { condition: q.condition }),
      ...(q.gripSize && { gripSize: q.gripSize }),
      ...((q.minPrice !== undefined || q.maxPrice !== undefined) && {
        price: { gte: q.minPrice, lte: q.maxPrice },
      }),
    };

    const term = q.q?.trim();
    const searchIds = term ? await this.idsMatchingSearch(term) : undefined;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      brand: { isActive: true, ...(q.brand && { slug: q.brand }) },
      category: { isActive: true, ...(q.category && { slug: q.category }) },
      variants: { some: variantFilter },
      ...(searchIds && { id: { in: searchIds } }),
      ...(q.level && { level: q.level }),
      ...(q.playStyle && { playStyle: q.playStyle }),
      ...(q.balance && { balance: q.balance }),
    };
    const [total, items] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        include: publicProductInclude,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return { items, total, page, limit };
  }

  /** ILIKE trên Postgres: không phân biệt hoa thường, tìm theo tên, slug, hãng, mã nội bộ. */
  private async idsMatchingSearch(term: string): Promise<string[]> {
    const safe = term.replace(/[%_]/g, '').trim();
    if (!safe) return [];
    const pattern = `%${safe}%`;
    const slug = `%${slugify(safe)}%`;
    const rows = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT DISTINCT p.id
      FROM "Product" p
      INNER JOIN "Brand" b ON b.id = p."brandId"
      LEFT JOIN "ProductVariant" v ON v."productId" = p.id
      WHERE p.name ILIKE ${pattern}
         OR p.slug ILIKE ${pattern}
         OR p.slug ILIKE ${slug}
         OR b.name ILIKE ${pattern}
         OR v."internalCode" ILIKE ${pattern}
    `;
    return rows.map((r) => r.id);
  }

  async bySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: publicProductInclude,
    });
    if (
      !product ||
      !product.isActive ||
      !product.brand.isActive ||
      !product.category.isActive
    ) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }
    return product;
  }

  /** Ưu tiên cùng hãng; thiếu thì bù cùng trọng lượng (gram), tối đa 6 cây còn hàng. */
  async related(slug: string) {
    const product = await this.bySlug(slug);
    const base = {
      isActive: true,
      id: { not: product.id },
      brand: { isActive: true },
      category: { isActive: true },
      variants: { some: { stock: { gt: 0 } } },
    } satisfies Prisma.ProductWhereInput;

    const byBrand = await this.prisma.product.findMany({
      where: { ...base, brandId: product.brandId },
      include: publicProductInclude,
      orderBy: { createdAt: 'desc' },
      take: 6,
    });
    if (byBrand.length >= 6) return byBrand;

    const taken = new Set(byBrand.map((p) => p.id));
    const byWeight = await this.prisma.product.findMany({
      where: {
        ...base,
        id: { notIn: [product.id, ...taken] },
        weightGrams: product.weightGrams,
      },
      include: publicProductInclude,
      orderBy: { createdAt: 'desc' },
      take: 6 - byBrand.length,
    });
    const mixed = [...byBrand, ...byWeight];
    if (mixed.length >= 6) return mixed;

    const taken2 = new Set(mixed.map((p) => p.id));
    const byClass = await this.prisma.product.findMany({
      where: {
        ...base,
        id: { notIn: [product.id, ...taken2] },
        weightClass: product.weightClass,
      },
      include: publicProductInclude,
      orderBy: { createdAt: 'desc' },
      take: 6 - mixed.length,
    });
    return [...mixed, ...byClass];
  }

  categories() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  brands() {
    return this.prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }
}

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
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

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      brand: { isActive: true, ...(q.brand && { slug: q.brand }) },
      category: { isActive: true, ...(q.category && { slug: q.category }) },
      variants: { some: variantFilter },
      ...(q.q && { name: { contains: q.q, mode: 'insensitive' } }),
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

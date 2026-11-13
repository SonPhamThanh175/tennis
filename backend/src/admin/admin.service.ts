import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { OrdersService } from '../orders/orders.service.js';
import { headSizeClassOf, weightClassOf } from '../common/racquet.js';
import {
  CreateProductDto,
  CreateTaxonomyDto,
  CreateVariantDto,
  UpdateProductDto,
  UpdateTaxonomyDto,
  UpdateVariantDto,
} from '../products/products.dto.js';

type Status = 'PENDING' | 'PAID' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
type Taxonomy = 'brand' | 'category';

@Injectable()
export class AdminService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(OrdersService) private readonly orders: OrdersService,
  ) {}

  async stats() {
    const [users, products, orders, revenue, soldItems, inStock, byStatus] =
      await Promise.all([
        this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
        this.prisma.product.count(),
        this.prisma.order.count(),
        this.prisma.order.aggregate({
          _sum: { totalPrice: true },
          where: { status: { in: ['PAID', 'SHIPPING', 'COMPLETED'] } },
        }),
        this.prisma.orderItem.findMany({
          where: { order: { status: { in: ['PAID', 'SHIPPING', 'COMPLETED'] } } },
          select: { unitPrice: true, unitCost: true, quantity: true },
        }),
        this.prisma.productVariant.count({ where: { stock: { gt: 0 } } }),
        this.prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
      ]);
    // Lợi nhuận chỉ tính trên dòng hàng có giá nhập.
    const profit = soldItems.reduce(
      (sum, i) =>
        i.unitCost == null ? sum : sum + (i.unitPrice - i.unitCost) * i.quantity,
      0,
    );
    return {
      users,
      products,
      orders,
      inStock,
      revenue: revenue._sum.totalPrice ?? 0,
      profit,
      ordersByStatus: Object.fromEntries(
        byStatus.map((s) => [s.status, s._count._all]),
      ),
    };
  }

  // ---- Mẫu vợt ----

  listProducts() {
    return this.prisma.product.findMany({
      include: { category: true, brand: true, variants: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createProduct(dto: CreateProductDto) {
    const { variants, ...rest } = dto;
    await this.ensureTaxonomyIds(dto.categoryId, dto.brandId);
    return this.guardUnique(() =>
      this.prisma.product.create({
        data: {
          ...rest,
          weightClass: weightClassOf(dto.weightGrams),
          headSizeClass: headSizeClassOf(dto.headSizeSqIn),
          variants: { create: variants },
        },
        include: { variants: true },
      }),
    );
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    const current = await this.ensureProduct(id);
    if (dto.categoryId || dto.brandId) {
      await this.ensureTaxonomyIds(
        dto.categoryId ?? current.categoryId,
        dto.brandId ?? current.brandId,
      );
    }
    return this.guardUnique(() =>
      this.prisma.product.update({
        where: { id },
        data: {
          ...dto,
          ...(dto.weightGrams !== undefined && {
            weightClass: weightClassOf(dto.weightGrams),
          }),
          ...(dto.headSizeSqIn !== undefined && {
            headSizeClass: headSizeClassOf(dto.headSizeSqIn),
          }),
        },
        include: { variants: true },
      }),
    );
  }

  /** Ẩn sản phẩm thay vì xóa để không làm mất lịch sử đơn hàng. */
  async deactivateProduct(id: string) {
    await this.ensureProduct(id);
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ---- Từng cây vợt (variant) ----

  /** Kho vợt: từng cây theo mã nội bộ, lọc còn hàng / đã bán. */
  listVariants(inStock?: boolean) {
    return this.prisma.productVariant.findMany({
      where: inStock === undefined ? undefined : { stock: inStock ? { gt: 0 } : 0 },
      include: { product: { include: { brand: true, category: true } } },
      orderBy: { internalCode: 'asc' },
    });
  }

  async getVariant(id: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id },
      include: { product: { include: { brand: true, category: true } } },
    });
    if (!variant) throw new NotFoundException('Không tìm thấy cây vợt');
    return variant;
  }

  async createVariant(productId: string, dto: CreateVariantDto) {
    await this.ensureProduct(productId);
    return this.guardUnique(() =>
      this.prisma.productVariant.create({ data: { ...dto, productId } }),
    );
  }

  async updateVariant(id: string, dto: UpdateVariantDto) {
    const exists = await this.prisma.productVariant.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Không tìm thấy cây vợt');
    // Kiểm tra theo trạng thái sau khi cập nhật: hàng cũ phải có mô tả tình trạng.
    const condition = dto.condition ?? exists.condition;
    const note = (dto.conditionNote ?? exists.conditionNote)?.trim();
    if (condition !== 'NEW' && !note) {
      throw new BadRequestException('Hàng cũ phải có mô tả tình trạng');
    }
    return this.guardUnique(() =>
      this.prisma.productVariant.update({ where: { id }, data: dto }),
    );
  }

  // ---- Thương hiệu / danh mục ----

  listTaxonomy(kind: Taxonomy) {
    const args = {
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    } as const;
    return kind === 'brand'
      ? this.prisma.brand.findMany(args)
      : this.prisma.category.findMany(args);
  }

  createTaxonomy(kind: Taxonomy, dto: CreateTaxonomyDto) {
    return this.guardUnique(() =>
      kind === 'brand'
        ? this.prisma.brand.create({ data: dto })
        : this.prisma.category.create({ data: dto }),
    );
  }

  async updateTaxonomy(kind: Taxonomy, id: string, dto: UpdateTaxonomyDto) {
    await this.ensureTaxonomy(kind, id);
    return this.guardUnique(() =>
      kind === 'brand'
        ? this.prisma.brand.update({ where: { id }, data: dto })
        : this.prisma.category.update({ where: { id }, data: dto }),
    );
  }

  /** Còn sản phẩm dùng thì chặn xóa; chỉ cho ẩn. */
  async deleteTaxonomy(kind: Taxonomy, id: string) {
    const item = await this.ensureTaxonomy(kind, id);
    const used =
      kind === 'brand'
        ? await this.prisma.product.count({ where: { brandId: id } })
        : await this.prisma.product.count({ where: { categoryId: id } });
    if (used > 0) {
      throw new ConflictException(
        `Còn ${used} sản phẩm đang dùng "${item.name}". Hãy ẩn thay vì xóa.`,
      );
    }
    return kind === 'brand'
      ? this.prisma.brand.delete({ where: { id } })
      : this.prisma.category.delete({ where: { id } });
  }

  // ---- Đơn hàng ----

  listOrders(status?: Status) {
    return this.prisma.order.findMany({
      where: status ? { status } : undefined,
      include: {
        items: true,
        payment: true,
        address: true,
        user: { select: { id: true, email: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOrderStatus(id: string, status: Status) {
    if (status === 'CANCELLED') return this.orders.cancel(id);
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true, payment: true },
    });
  }

  // ---- helper ----

  private async ensureProduct(id: string) {
    const p = await this.prisma.product.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Không tìm thấy sản phẩm');
    return p;
  }

  private async ensureTaxonomy(kind: Taxonomy, id: string) {
    const item =
      kind === 'brand'
        ? await this.prisma.brand.findUnique({ where: { id } })
        : await this.prisma.category.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException(
        kind === 'brand' ? 'Không tìm thấy thương hiệu' : 'Không tìm thấy danh mục',
      );
    }
    return item;
  }

  private async ensureTaxonomyIds(categoryId: string, brandId: string) {
    await this.ensureTaxonomy('category', categoryId);
    await this.ensureTaxonomy('brand', brandId);
  }

  /** Đổi lỗi trùng khóa duy nhất (P2002) thành 409 dễ hiểu. */
  private async guardUnique<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        const target = (e.meta?.target as string[] | string | undefined) ?? '';
        throw new ConflictException(`Giá trị đã tồn tại (${String(target)})`);
      }
      throw e;
    }
  }
}

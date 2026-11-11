import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { publicVariantSelect } from '../products/products.service.js';

const cartInclude = {
  items: {
    include: {
      variant: {
        select: {
          ...publicVariantSelect,
          product: {
            select: { id: true, name: true, slug: true, images: true },
          },
        },
      },
    },
    orderBy: { id: 'asc' },
  },
} as const;

@Injectable()
export class CartService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async get(userId: string) {
    const cart = await this.prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
      include: cartInclude,
    });
    const totalPrice = cart.items.reduce(
      (sum, i) => sum + i.variant.price * i.quantity,
      0,
    );
    return { ...cart, totalPrice };
  }

  async add(userId: string, variantId: string, quantity: number) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
    });
    if (!variant) throw new NotFoundException('Biến thể không tồn tại');

    const cart = await this.prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
    const existing = await this.prisma.cartItem.findUnique({
      where: { cartId_variantId: { cartId: cart.id, variantId } },
    });
    const next = (existing?.quantity ?? 0) + quantity;
    if (next > variant.stock) {
      throw new BadRequestException(`Chỉ còn ${variant.stock} sản phẩm trong kho`);
    }
    await this.prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId: cart.id, variantId } },
      update: { quantity: next },
      create: { cartId: cart.id, variantId, quantity },
    });
    return this.get(userId);
  }

  async update(userId: string, itemId: string, quantity: number) {
    const item = await this.ownedItem(userId, itemId);
    if (quantity > item.variant.stock) {
      throw new BadRequestException(
        `Chỉ còn ${item.variant.stock} sản phẩm trong kho`,
      );
    }
    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
    return this.get(userId);
  }

  async remove(userId: string, itemId: string) {
    await this.ownedItem(userId, itemId);
    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return this.get(userId);
  }

  private async ownedItem(userId: string, itemId: string) {
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cart: { userId } },
      include: { variant: true },
    });
    if (!item) throw new NotFoundException('Không tìm thấy mục trong giỏ');
    return item;
  }
}

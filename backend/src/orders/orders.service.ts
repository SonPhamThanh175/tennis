import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateOrderDto } from './orders.dto.js';

// unitCost là giá nhập, chỉ dành cho admin nên không trả ra cho khách.
const orderInclude = {
  items: { omit: { unitCost: true } },
  payment: true,
  address: true,
} as const;

@Injectable()
export class OrdersService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  /** Tạo đơn từ giỏ hàng: kiểm tra và trừ kho, tạo payment, xóa giỏ, tất cả trong một transaction. */
  async createFromCart(userId: string, dto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: { items: { include: { variant: { include: { product: true } } } } },
      });
      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('Giỏ hàng trống');
      }

      for (const item of cart.items) {
        // Trừ kho có điều kiện để tránh bán vượt số lượng khi nhiều đơn cùng lúc.
        const { count } = await tx.productVariant.updateMany({
          where: { id: item.variantId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (count === 0) {
          throw new BadRequestException(
            `"${item.variant.product.name}" không đủ hàng`,
          );
        }
      }

      const totalPrice = cart.items.reduce(
        (sum, i) => sum + i.variant.price * i.quantity,
        0,
      );
      const address = await tx.address.create({
        data: { userId, ...dto.address },
      });
      const order = await tx.order.create({
        data: {
          userId,
          addressId: address.id,
          totalPrice,
          note: dto.note,
          items: {
            create: cart.items.map((i) => ({
              variantId: i.variantId,
              productName: i.variant.product.name,
              unitPrice: i.variant.price,
              unitCost: i.variant.costPrice,
              quantity: i.quantity,
            })),
          },
          payment: {
            create: { method: dto.paymentMethod, amount: totalPrice },
          },
        },
        include: orderInclude,
      });
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return order;
    });
  }

  listMine(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMine(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: orderInclude,
    });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    return order;
  }

  /** Khách chỉ hủy được đơn đang chờ; hoàn lại kho. */
  async cancelMine(userId: string, id: string) {
    const order = await this.getMine(userId, id);
    if (order.status !== 'PENDING') {
      throw new BadRequestException('Chỉ hủy được đơn đang chờ xử lý');
    }
    return this.cancel(id);
  }

  async cancel(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
      if (order.status === 'CANCELLED') return order;
      for (const item of order.items) {
        if (!item.variantId) continue;
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }
      return tx.order.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: orderInclude,
      });
    });
  }
}

import { Type } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';

export const PAYMENT_METHODS = ['STRIPE', 'VNPAY', 'MOMO', 'COD'] as const;
export const ORDER_STATUSES = [
  'PENDING',
  'PAID',
  'SHIPPING',
  'COMPLETED',
  'CANCELLED',
] as const;

export class ShippingAddressDto {
  @IsString() fullName: string;
  @Matches(/^0\d{9}$/, { message: 'Số điện thoại gồm 10 chữ số, bắt đầu bằng 0' })
  phone: string;
  @IsString() line1: string;
  @IsOptional() @IsString() ward?: string;
  @IsOptional() @IsString() district?: string;
  @IsString() city: string;
}

export class CreateOrderDto {
  @ValidateNested() @Type(() => ShippingAddressDto)
  address: ShippingAddressDto;
  @IsEnum(PAYMENT_METHODS) paymentMethod: (typeof PAYMENT_METHODS)[number];
  @IsOptional() @IsString() note?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(ORDER_STATUSES) status: (typeof ORDER_STATUSES)[number];
}

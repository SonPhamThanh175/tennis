import type {
  Balance,
  Condition,
  GripSize,
  HeadSizeClass,
  OrderStatus,
  PaymentMethod,
  PlayStyle,
  SkillLevel,
  StringPattern,
  WeightClass,
} from '@/types/api';

const vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
export const formatVnd = (n: number) => vnd.format(n);

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Chờ xử lý',
  PAID: 'Đã thanh toán',
  SHIPPING: 'Đang giao',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

/** Màu preset của antd Tag. */
export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: 'gold',
  PAID: 'blue',
  SHIPPING: 'geekblue',
  COMPLETED: 'green',
  CANCELLED: 'default',
};

export const LEVEL_LABEL: Record<SkillLevel, string> = {
  BEGINNER: 'Mới chơi',
  INTERMEDIATE: 'Trung cấp',
  ADVANCED: 'Nâng cao',
};

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  COD: 'Thanh toán khi nhận hàng (COD)',
  STRIPE: 'Thẻ quốc tế (Stripe)',
  VNPAY: 'VNPay',
  MOMO: 'MoMo',
};

export const CONDITION_LABEL: Record<Condition, string> = {
  NEW: 'Mới 100%',
  LIKE_NEW: 'Lướt 98%',
  GOOD: 'Tốt 90%',
  FAIR: 'Khá 80%',
};

export const CONDITION_TAG_COLOR: Record<Condition, string> = {
  NEW: 'green',
  LIKE_NEW: 'cyan',
  GOOD: 'blue',
  FAIR: 'orange',
};

export const GRIP_LABEL = (g: GripSize) => `${g} (L${g.slice(1)})`;

export const WEIGHT_CLASS_LABEL: Record<WeightClass, string> = {
  ULTRA_LIGHT: 'Siêu nhẹ (<250g)',
  LIGHT: 'Nhẹ (250-269g)',
  MEDIUM: 'Trung bình (270-289g)',
  HEAVY: 'Nặng (290-310g)',
  EXTRA_HEAVY: 'Rất nặng (>310g)',
};

export const HEAD_SIZE_LABEL: Record<HeadSizeClass, string> = {
  SMALL: 'Nhỏ (85-97 in²)',
  MIDPLUS: 'Mid-plus (98-102 in²)',
  OVERSIZE: 'Oversize (≥103 in²)',
};

export const BALANCE_LABEL: Record<Balance, string> = {
  HEAD_LIGHT: 'Nặng cán (Head-light)',
  EVEN: 'Cân bằng',
  HEAD_HEAVY: 'Nặng đầu (Head-heavy)',
};

export const PLAY_STYLE_LABEL: Record<PlayStyle, string> = {
  POWER: 'Lực',
  CONTROL: 'Kiểm soát',
  SPIN: 'Xoáy',
  ALL_ROUND: 'Toàn diện',
};

export const STRING_PATTERN_LABEL: Record<StringPattern, string> = {
  P16X19: '16x19',
  P16X18: '16x18',
  P16X20: '16x20',
  P18X20: '18x20',
  P18X19: '18x19',
};

/** Chuyển mảng nhãn thành options cho Select/Radio của antd. */
export const toOptions = <K extends string>(map: Record<K, string>) =>
  (Object.keys(map) as K[]).map((value) => ({ value, label: map[value] }));

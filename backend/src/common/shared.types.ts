export type Role = 'CUSTOMER' | 'ADMIN';

export type PaymentMethod = 'STRIPE' | 'VNPAY' | 'MOMO' | 'COD';

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'SHIPPING'
  | 'COMPLETED'
  | 'CANCELLED';

export type ProductCategory =
  | 'RACKET'
  | 'SHOES'
  | 'APPAREL'
  | 'BALLS'
  | 'ACCESSORIES';

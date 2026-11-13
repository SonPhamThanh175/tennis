export type Role = 'CUSTOMER' | 'ADMIN';
export type PaymentMethod = 'STRIPE' | 'VNPAY' | 'MOMO' | 'COD';
export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';

export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type WeightClass = 'ULTRA_LIGHT' | 'LIGHT' | 'MEDIUM' | 'HEAVY' | 'EXTRA_HEAVY';
export type HeadSizeClass = 'SMALL' | 'MIDPLUS' | 'OVERSIZE';
export type Balance = 'HEAD_LIGHT' | 'EVEN' | 'HEAD_HEAVY';
export type StringPattern = 'P16X19' | 'P16X18' | 'P16X20' | 'P18X20' | 'P18X19';
export type PlayStyle = 'POWER' | 'CONTROL' | 'SPIN' | 'ALL_ROUND';
export type Condition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR';
export type GripSize = 'G0' | 'G1' | 'G2' | 'G3' | 'G4' | 'G5';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  isActive?: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  isActive?: boolean;
}

export interface TaxonomyItem extends Category {
  isActive: boolean;
  _count: { products: number };
}

/** Một cây vợt cụ thể (có mã nội bộ, tình trạng, giá riêng). API công khai không có costPrice. */
export interface Variant {
  id: string;
  productId: string;
  internalCode: string;
  gripSize: GripSize;
  condition: Condition;
  conditionNote: string | null;
  images: string[];
  price: number;
  originalPrice: number | null;
  stock: number;
}

export interface AdminVariant extends Variant {
  costPrice: number | null;
  product: Omit<Product, 'variants'>;
}

/** Mẫu vợt: thông số kỹ thuật dùng chung cho các cây cùng mẫu. */
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  level: SkillLevel;
  weightGrams: number;
  weightClass: WeightClass;
  headSizeSqIn: number;
  headSizeClass: HeadSizeClass;
  balance: Balance;
  stringPattern: StringPattern;
  playStyle: PlayStyle;
  stiffnessRA: number | null;
  swingWeight: number | null;
  beamWidthMm: string | null;
  isActive: boolean;
  category: Category;
  brand: Brand;
  variants: Variant[];
}

export interface VariantInput {
  internalCode: string;
  gripSize: GripSize;
  condition: Condition;
  conditionNote?: string;
  images: string[];
  price: number;
  originalPrice?: number;
  costPrice?: number;
  stock: number;
}

export interface CreateProductInput {
  name: string;
  slug: string;
  description: string;
  images: string[];
  level: SkillLevel;
  weightGrams: number;
  headSizeSqIn: number;
  balance: Balance;
  stringPattern: StringPattern;
  playStyle: PlayStyle;
  stiffnessRA?: number;
  swingWeight?: number;
  beamWidthMm?: string;
  categoryId: string;
  brandId: string;
  variants: VariantInput[];
}

export type UpdateProductInput = Partial<Omit<CreateProductInput, 'variants' | 'slug'>> & {
  isActive?: boolean;
};

export type UpdateVariantInput = Partial<VariantInput>;

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductQuery {
  q?: string;
  category?: string;
  brand?: string;
  level?: SkillLevel;
  condition?: Condition;
  gripSize?: GripSize;
  playStyle?: PlayStyle;
  balance?: Balance;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface CartItem {
  id: string;
  variantId: string;
  quantity: number;
  variant: Variant & { product: { id: string; name: string; slug: string } };
}

export interface Cart {
  id: string;
  items: CartItem[];
  totalPrice: number;
}

export interface Address {
  fullName: string;
  phone: string;
  line1: string;
  ward?: string;
  district?: string;
  city: string;
}

export interface CreateOrderInput {
  address: Address;
  paymentMethod: PaymentMethod;
  note?: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  unitPrice: number;
  unitCost: number | null;
  quantity: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  totalPrice: number;
  note: string | null;
  createdAt: string;
  items: OrderItem[];
  payment: { method: PaymentMethod; status: string; amount: number } | null;
  address: Address;
  user?: { id: string; email: string; fullName: string };
}

export interface AdminStats {
  users: number;
  products: number;
  orders: number;
  inStock: number;
  revenue: number;
  profit: number;
  ordersByStatus: Partial<Record<OrderStatus, number>>;
}

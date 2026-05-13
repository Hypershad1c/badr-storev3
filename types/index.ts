import type {
  User,
  Product,
  Category,
  Order,
  OrderItem,
  Review,
  Address,
  VirtualRequest,
  Coupon,
  Role,
  ProductType,
  OrderStatus,
  PaymentStatus,
  ShippingStatus,
  VirtualRequestStatus,
} from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// Re-export Prisma enums for convenience
// ─────────────────────────────────────────────────────────────────────────────
export type {
  Role,
  ProductType,
  OrderStatus,
  PaymentStatus,
  ShippingStatus,
  VirtualRequestStatus,
};

// ─────────────────────────────────────────────────────────────────────────────
// Extended types (with relations)
// ─────────────────────────────────────────────────────────────────────────────

export type ProductWithCategory = Product & {
  category: Category;
  reviews: Review[];
  _count?: { reviews: number; wishlist: number };
};

export type OrderWithItems = Order & {
  items: (OrderItem & { product: Product })[];
  address?: Address | null;
  user: Pick<User, "id" | "name" | "email">;
};

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
  variant?: Record<string, string>;
  type: ProductType;
};

export type ProductVariants = {
  colors?: { name: string; value: string }[];
  sizes?: string[];
  [key: string]: unknown;
};

// ─────────────────────────────────────────────────────────────────────────────
// API Response types
// ─────────────────────────────────────────────────────────────────────────────

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard analytics
// ─────────────────────────────────────────────────────────────────────────────

export type DashboardStats = {
  revenue: number;
  revenueChange: number;
  orders: number;
  ordersChange: number;
  customers: number;
  customersChange: number;
  products: number;
};

export type RevenueData = {
  month: string;
  revenue: number;
  orders: number;
};

// ─────────────────────────────────────────────────────────────────────────────
// Form schemas (Zod inferred types)
// ─────────────────────────────────────────────────────────────────────────────

export type LoginFormData = {
  email: string;
  password: string;
};

export type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type CheckoutFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country: string;
  state?: string;
  city: string;
  postalCode: string;
  line1: string;
  line2?: string;
  couponCode?: string;
};

export type ProductFormData = {
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  stock: number;
  sku?: string;
  featured: boolean;
  type: ProductType;
  categoryId: string;
  images: string[];
  variants?: ProductVariants;
};

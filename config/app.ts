export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? "Apex Store",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  description: "Premium products and digital services for the modern world",
  adminEmail: process.env.ADMIN_EMAIL ?? "admin@apexstore.com",
  currency: "USD",
  currencySymbol: "$",
  productsPerPage: 12,
  maxCartItems: 10,
  maxImageSize: 10 * 1024 * 1024, // 10MB
  supportedImageTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export const SHIPPING_STATUS_LABELS: Record<string, string> = {
  NOT_SHIPPED: "Not Shipped",
  PREPARING: "Preparing",
  SHIPPED: "Shipped",
  IN_TRANSIT: "In Transit",
  DELIVERED: "Delivered",
  RETURNED: "Returned",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

export const VIRTUAL_REQUEST_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrator",
  BUSINESS_MANAGER: "Business Manager",
  CUSTOMER: "Customer",
};

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Best Rated" },
] as const;

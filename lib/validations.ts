import { z } from "zod";

// ── Auth ──────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ── Product ───────────────────────────────────────────────────────────────────
export const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  shortDescription: z.string().optional(),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  comparePrice: z.coerce.number().optional().nullable(),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  sku: z.string().optional(),
  featured: z.boolean().default(false),
  type: z.enum(["PHYSICAL", "VIRTUAL"]),
  categoryId: z.string().min(1, "Category is required"),
  images: z.array(z.string()).min(1, "At least one image is required"),
});

// ── Category ──────────────────────────────────────────────────────────────────
export const categorySchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().min(2, "Slug is required"),
  description: z.string().optional(),
  image: z.string().optional(),
});

// ── Checkout ──────────────────────────────────────────────────────────────────
export const checkoutSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  state: z.string().optional(),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().optional(),
  couponCode: z.string().optional(),
  saveAddress: z.boolean().default(false),
});

// ── Review ────────────────────────────────────────────────────────────────────
export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

// ── Contact ───────────────────────────────────────────────────────────────────
export const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  subject: z.string().min(5, "Subject is required"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

// ── Virtual Request ───────────────────────────────────────────────────────────
export const virtualRequestSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  message: z.string().min(20, "Please describe your request in detail"),
  files: z.array(z.string()).optional(),
});

// ── Profile ───────────────────────────────────────────────────────────────────
export const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  avatar: z.string().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ── Coupon ────────────────────────────────────────────────────────────────────
export const couponSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").toUpperCase(),
  discount: z.coerce.number().min(0.01, "Discount must be greater than 0"),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  minOrderAmount: z.coerce.number().optional().nullable(),
  maxUses: z.coerce.number().int().optional().nullable(),
  expirationDate: z.string().optional().nullable(),
  active: z.boolean().default(true),
});

// Types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type VirtualRequestInput = z.infer<typeof virtualRequestSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type CouponInput = z.infer<typeof couponSchema>;

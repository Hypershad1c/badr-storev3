"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "BUSINESS_MANAGER")) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function createProduct(data: unknown) {
  await requireAdmin();
  const parsed = productSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const slug = slugify(parsed.data.name);
  const existing = await prisma.product.findUnique({ where: { slug } });
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  const product = await prisma.product.create({
    data: { ...parsed.data, slug: finalSlug },
  });

  revalidatePath("/dashboard/products");
  revalidatePath("/shop");
  return { success: true, data: product };
}

export async function updateProduct(id: string, data: unknown) {
  await requireAdmin();
  const parsed = productSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const product = await prisma.product.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath("/dashboard/products");
  revalidatePath(`/product/${product.slug}`);
  revalidatePath("/shop");
  return { success: true, data: product };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await prisma.product.delete({ where: { id } });
  revalidatePath("/dashboard/products");
  revalidatePath("/shop");
  return { success: true };
}

export async function toggleProductFeatured(id: string, featured: boolean) {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { featured } });
  revalidatePath("/dashboard/products");
  return { success: true };
}

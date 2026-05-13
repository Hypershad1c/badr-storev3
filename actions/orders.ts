"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { OrderStatus, ShippingStatus } from "@prisma/client";

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "BUSINESS_MANAGER")) {
    return { error: "Unauthorized" };
  }

  await prisma.order.update({ where: { id: orderId }, data: { status } });
  revalidatePath("/dashboard/orders");
  return { success: true };
}

export async function updateShippingStatus(orderId: string, shippingStatus: ShippingStatus) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "BUSINESS_MANAGER")) {
    return { error: "Unauthorized" };
  }

  await prisma.order.update({ where: { id: orderId }, data: { shippingStatus } });
  revalidatePath("/dashboard/orders");
  return { success: true };
}

export async function getUserOrders() {
  const session = await auth();
  if (!session) return [];

  return prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: { include: { product: { select: { name: true, images: true } } } },
      address: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

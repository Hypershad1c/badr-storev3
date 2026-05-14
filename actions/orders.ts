"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  OrderStatus,
  ShippingStatus,
  PaymentStatus,
} from "@prisma/client";

// ==============================
// UPDATE ORDER STATUS
// ==============================
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
) {
  const session = await auth();

  if (
    !session ||
    (session.user.role !== "ADMIN" &&
      session.user.role !== "BUSINESS_MANAGER")
  ) {
    return { error: "Unauthorized" };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  revalidatePath("/dashboard/orders");

  return { success: true };
}

// ==============================
// UPDATE SHIPPING STATUS
// ==============================
export async function updateShippingStatus(
  orderId: string,
  shippingStatus: ShippingStatus
) {
  const session = await auth();

  if (
    !session ||
    (session.user.role !== "ADMIN" &&
      session.user.role !== "BUSINESS_MANAGER")
  ) {
    return { error: "Unauthorized" };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { shippingStatus },
  });

  revalidatePath("/dashboard/orders");

  return { success: true };
}

// ==============================
// GET USER ORDERS
// ==============================
export async function getUserOrders() {
  const session = await auth();

  if (!session) return [];

  return prisma.order.findMany({
    where: {
      userId: session.user.id,
    },

    include: {
      items: {
        include: {
          product: {
            select: {
              name: true,
              images: true,
            },
          },
        },
      },

      address: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

// ==============================
// DELETE ORDER
// ==============================
export async function deleteOrder(orderId: string) {
  const session = await auth();

  if (
    !session ||
    (session.user.role !== "ADMIN" &&
      session.user.role !== "BUSINESS_MANAGER")
  ) {
    return { error: "Unauthorized" };
  }

  try {
    // delete payment first if exists
    await prisma.payment.deleteMany({
      where: {
        orderId,
      },
    });

    // delete order items
    await prisma.orderItem.deleteMany({
      where: {
        orderId,
      },
    });

    // delete order
    await prisma.order.delete({
      where: {
        id: orderId,
      },
    });

    revalidatePath("/dashboard/orders");

    return { success: true };
  } catch (error) {
    console.error(error);

    return {
      error: "Failed to delete order",
    };
  }
}

// ==============================
// CREATE MANUAL ORDER
// ==============================
export async function createManualOrder(data: {
  userId: string;
  productId: string;
  quantity: number;
  notes?: string;
}) {
  const session = await auth();

  if (
    !session ||
    (session.user.role !== "ADMIN" &&
      session.user.role !== "BUSINESS_MANAGER")
  ) {
    return { error: "Unauthorized" };
  }

  const product = await prisma.product.findUnique({
    where: {
      id: data.productId,
    },
  });

  if (!product) {
    return {
      error: "Product not found",
    };
  }

  const subtotal = product.price * data.quantity;

  const order = await prisma.order.create({
    data: {
      userId: data.userId,

      subtotal,
      total: subtotal,

      tax: 0,
      discount: 0,

      notes: data.notes,

      status: "PENDING",
      paymentStatus: "PENDING",
      shippingStatus: "NOT_SHIPPED",

      items: {
        create: {
          productId: product.id,
          quantity: data.quantity,
          price: product.price,
        },
      },
    },

    include: {
      user: true,

      items: {
        include: {
          product: true,
        },
      },
    },
  });

  revalidatePath("/dashboard/orders");

  return {
    success: true,
    order,
  };
}

// ==============================
// UPDATE FULL ORDER
// ==============================
export async function updateOrder(
  orderId: string,
  data: {
    status?: OrderStatus;
    shippingStatus?: ShippingStatus;
    paymentStatus?: PaymentStatus;
    notes?: string;
  }
) {
  const session = await auth();

  if (
    !session ||
    (session.user.role !== "ADMIN" &&
      session.user.role !== "BUSINESS_MANAGER")
  ) {
    return { error: "Unauthorized" };
  }

  try {
    const order = await prisma.order.update({
      where: {
        id: orderId,
      },

      data: {
        ...(data.status && {
          status: data.status,
        }),

        ...(data.shippingStatus && {
          shippingStatus: data.shippingStatus,
        }),

        ...(data.paymentStatus && {
          paymentStatus: data.paymentStatus,
        }),

        ...(data.notes !== undefined && {
          notes: data.notes,
        }),
      },
    });

    revalidatePath("/dashboard/orders");

    return {
      success: true,
      order,
    };
  } catch (error) {
    console.error(error);

    return {
      error: "Failed to update order",
    };
  }
}

// ==============================
// CREATE WHATSAPP ORDER
// ==============================
export async function createWhatsAppOrder(data: {
  productId: string;
  quantity: number;
  variant?: Record<string, string>;
}) {
  try {
    const session = await auth();

    const product = await prisma.product.findUnique({
      where: {
        id: data.productId,
      },
    });

    if (!product) {
      return {
        error: "Product not found",
      };
    }

    // guest customer fallback
    let userId = session?.user?.id;

    // create guest user automatically
    if (!userId) {
      const guest = await prisma.user.create({
        data: {
          name: "WhatsApp Customer",
          email: `guest-${Date.now()}@whatsapp.local`,
          role: "CUSTOMER",
        },
      });

      userId = guest.id;
    }

    const subtotal = product.price * data.quantity;

    const order = await prisma.order.create({
      data: {
        userId,

        subtotal,
        total: subtotal,

        status: "PENDING",
        paymentStatus: "PENDING",
        shippingStatus: "NOT_SHIPPED",

        notes: `WhatsApp Order${
          data.variant
            ? ` | Variant: ${JSON.stringify(data.variant)}`
            : ""
        }`,

        items: {
          create: {
            productId: product.id,
            quantity: data.quantity,
            price: product.price,
            variant: data.variant,
          },
        },
      },

      include: {
        items: true,
      },
    });

    revalidatePath("/dashboard/orders");

    return {
      success: true,
      orderId: order.id,
    };
  } catch (error) {
    console.error(error);

    return {
      error: "Failed to create WhatsApp order",
    };
  }
}
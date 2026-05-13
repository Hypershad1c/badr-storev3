"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { virtualRequestSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { VirtualRequestStatus } from "@prisma/client";
import { sendVirtualRequestEmail } from "@/lib/email";

export async function createVirtualRequest(data: unknown) {
  const session = await auth();
  if (!session) return { error: "Please sign in to submit a request" };

  const parsed = virtualRequestSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const request = await prisma.virtualRequest.create({
    data: {
      userId: session.user.id,
      productId: parsed.data.productId,
      message: parsed.data.message,
      files: parsed.data.files ?? [],
    },
    include: { product: true, user: true },
  });

  // Send notification email
  await sendVirtualRequestEmail({
    customerName: request.user.name,
    customerEmail: request.user.email,
    serviceName: request.product.name,
    message: request.message,
    requestId: request.id,
  });

  revalidatePath("/dashboard/virtual-requests");
  return { success: true, data: request };
}

export async function updateVirtualRequestStatus(
  requestId: string,
  status: VirtualRequestStatus,
  adminNote?: string
) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "BUSINESS_MANAGER")) {
    return { error: "Unauthorized" };
  }

  await prisma.virtualRequest.update({
    where: { id: requestId },
    data: { status, adminNote },
  });

  revalidatePath("/dashboard/virtual-requests");
  return { success: true };
}

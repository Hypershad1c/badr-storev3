import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { virtualRequestSchema } from "@/lib/validations";
import { sendVirtualRequestEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const where =
    session.user.role === "ADMIN" || session.user.role === "BUSINESS_MANAGER"
      ? {}
      : { userId: session.user.id };

  const requests = await prisma.virtualRequest.findMany({
    where,
    include: {
      user: { select: { name: true, email: true, avatar: true } },
      product: { select: { name: true, images: true, price: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: requests });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = virtualRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const request = await prisma.virtualRequest.create({
    data: {
      userId: session.user.id,
      productId: parsed.data.productId,
      message: parsed.data.message,
      files: parsed.data.files ?? [],
    },
    include: { product: true, user: true },
  });

  await sendVirtualRequestEmail({
    customerName: request.user.name,
    customerEmail: request.user.email,
    serviceName: request.product.name,
    message: request.message,
    requestId: request.id,
  });

  return NextResponse.json({ data: request }, { status: 201 });
}

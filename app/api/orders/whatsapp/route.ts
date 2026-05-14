import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      productId,
      quantity,
      variants,
    } = body;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const total = product.price * quantity;

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,

        subtotal: total,
        total,

        status: "PENDING",

        paymentStatus: "PENDING",

        shippingStatus: "NOT_SHIPPED",

        notes: "WhatsApp Order",

        items: {
          create: {
            productId: product.id,
            quantity,
            price: product.price,
            variant: variants || undefined,
          },
        },
      },

      include: {
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
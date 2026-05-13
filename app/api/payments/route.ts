import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type { CartItem } from "@/types";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Please sign in to checkout" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { items, shippingAddress, couponCode } = body as {
      items: CartItem[];
      shippingAddress: {
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
      };
      couponCode?: string;
    };

    if (!items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Validate stock for physical products
    for (const item of items) {
      if (item.type === "PHYSICAL") {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product || product.stock < item.quantity) {
          return NextResponse.json(
            { error: `Insufficient stock for ${item.name}` },
            { status: 400 }
          );
        }
      }
    }

    // Handle coupon
    let discount = 0;
    let coupon = null;
    if (couponCode) {
      coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase(), active: true },
      });
      if (coupon) {
        const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
        if (!coupon.minOrderAmount || subtotal >= coupon.minOrderAmount) {
          discount =
            coupon.discountType === "PERCENTAGE"
              ? (subtotal * coupon.discount) / 100
              : coupon.discount;
        }
      }
    }

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const total = Math.max(0, subtotal - discount);

    // Create address
    const address = await prisma.address.create({
      data: {
        userId: session.user.id,
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        country: shippingAddress.country,
        state: shippingAddress.state,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        line1: shippingAddress.line1,
        line2: shippingAddress.line2,
        phone: shippingAddress.phone,
      },
    });

    // Create pending order
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        total,
        subtotal,
        discount,
        status: "PENDING",
        paymentStatus: "PENDING",
        addressId: address.id,
        couponCode: couponCode || null,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            variant: item.variant,
          })),
        },
      },
    });

    // Create Stripe session
    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: shippingAddress.email,
      line_items: items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      metadata: {
        orderId: order.id,
        userId: session.user.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${order.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?cancelled=true`,
    });

    // Link stripe session to payment
    await prisma.payment.create({
      data: {
        orderId: order.id,
        stripeSessionId: stripeSession.id,
        amount: total,
        currency: "usd",
        status: "PENDING",
      },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}

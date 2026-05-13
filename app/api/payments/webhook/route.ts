import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        if (!orderId) break;

        // Update order & payment
        const order = await prisma.order.update({
          where: { id: orderId },
          data: { status: "CONFIRMED", paymentStatus: "PAID" },
          include: {
            items: { include: { product: true } },
            user: true,
          },
        });

        await prisma.payment.update({
          where: { orderId },
          data: {
            status: "PAID",
            stripePaymentIntent: session.payment_intent as string,
          },
        });

        // Decrement stock for physical products
        for (const item of order.items) {
          if (item.product.type === "PHYSICAL") {
            await prisma.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            });
          }
        }

        // Send confirmation email
        await sendOrderConfirmationEmail({
          email: order.user.email,
          name: order.user.name,
          orderId: order.id,
          items: order.items.map((i) => ({
            name: i.product.name,
            quantity: i.quantity,
            price: i.price,
          })),
          total: order.total,
        });

        // Create notification
        await prisma.notification.create({
          data: {
            userId: order.userId,
            title: "Order Confirmed",
            message: `Your order #${orderId.slice(-8).toUpperCase()} has been confirmed.`,
            type: "SUCCESS",
            link: `/orders`,
          },
        });

        // Log activity
        await prisma.activityLog.create({
          data: {
            userId: order.userId,
            action: "ORDER_PLACED",
            entity: "Order",
            entityId: orderId,
          },
        });

        break;
      }

      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        await prisma.payment.updateMany({
          where: { stripePaymentIntent: intent.id },
          data: { status: "FAILED" },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

export const STRIPE_CONFIG = {
  currency: "usd",
  successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId={ORDER_ID}`,
  cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?cancelled=true`,
  paymentMethods: ["card"] as const,
} as const;

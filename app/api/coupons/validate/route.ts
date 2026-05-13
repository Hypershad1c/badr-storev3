import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const total = parseFloat(searchParams.get("total") || "0");

  if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase(), active: true },
  });

  if (!coupon) return NextResponse.json({ error: "Invalid or expired coupon" }, { status: 404 });

  if (coupon.expirationDate && new Date() > coupon.expirationDate) {
    return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });
  }

  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 });
  }

  if (coupon.minOrderAmount && total < coupon.minOrderAmount) {
    return NextResponse.json({
      error: `Minimum order of $${coupon.minOrderAmount.toFixed(2)} required`,
    }, { status: 400 });
  }

  const discount = coupon.discountType === "PERCENTAGE"
    ? (total * coupon.discount) / 100
    : coupon.discount;

  return NextResponse.json({ discount: Math.min(discount, total), code: coupon.code });
}

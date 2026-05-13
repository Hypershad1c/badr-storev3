import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "BUSINESS_MANAGER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ data: coupons });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const existing = await prisma.coupon.findUnique({ where: { code: body.code } });
    if (existing) return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
    const coupon = await prisma.coupon.create({
      data: {
        ...body,
        expirationDate: body.expirationDate ? new Date(body.expirationDate) : null,
      },
    });
    return NextResponse.json({ data: coupon }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}

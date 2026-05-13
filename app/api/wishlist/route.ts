import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wishlist = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    include: {
      product: { include: { category: true, reviews: true } },
    },
  });

  return NextResponse.json({ data: wishlist.map((w) => w.product) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId } = await req.json();

  const existing = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
  });

  if (existing) {
    await prisma.wishlist.delete({
      where: { userId_productId: { userId: session.user.id, productId } },
    });
    return NextResponse.json({ action: "removed" });
  }

  await prisma.wishlist.create({
    data: { userId: session.user.id, productId },
  });

  return NextResponse.json({ action: "added" });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { reviewSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const { productId } = body;
  if (!productId) return NextResponse.json({ error: "Product ID required" }, { status: 400 });

  try {
    const review = await prisma.review.upsert({
      where: { userId_productId: { userId: session.user.id, productId } },
      update: { rating: parsed.data.rating, comment: parsed.data.comment },
      create: { userId: session.user.id, productId, ...parsed.data },
    });
    return NextResponse.json({ data: review });
  } catch {
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}

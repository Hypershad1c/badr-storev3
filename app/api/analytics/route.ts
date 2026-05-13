import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "BUSINESS_MANAGER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "30";
  const days = parseInt(period);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  try {
    const [revenue, orders, customers, topCategories] = await Promise.all([
      prisma.payment.aggregate({
        where: { status: "PAID", createdAt: { gte: since } },
        _sum: { amount: true },
      }),
      prisma.order.count({ where: { createdAt: { gte: since } } }),
      prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: since } } }),
      prisma.$queryRaw<{ name: string; count: bigint }[]>`
        SELECT c.name, COUNT(DISTINCT p.id)::bigint as count
        FROM categories c
        JOIN products p ON p.category_id = c.id
        JOIN order_items oi ON oi.product_id = p.id
        JOIN orders o ON o.id = oi.order_id
        WHERE o.created_at >= ${since}
        GROUP BY c.name
        ORDER BY count DESC
        LIMIT 5
      `,
    ]);

    return NextResponse.json({
      revenue: revenue._sum.amount ?? 0,
      orders,
      customers,
      topCategories: topCategories.map((c) => ({ name: c.name, count: Number(c.count) })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}

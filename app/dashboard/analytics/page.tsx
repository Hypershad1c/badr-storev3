import { prisma } from "@/lib/prisma";
import { AnalyticsClient } from "./analytics-client";

async function getAnalyticsData() {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    revenueByMonth,
    topProducts,
    ordersByStatus,
    newUsersByMonth,
    categoryRevenue,
  ] = await Promise.all([
    prisma.$queryRaw<{ month: string; revenue: number; orders: bigint }[]>`
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YY') as month,
        COALESCE(SUM(amount), 0)::float as revenue,
        COUNT(*)::bigint as orders
      FROM payments
      WHERE status = 'PAID' AND created_at >= ${sixMonthsAgo}
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at)
    `,
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      _count: true,
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.$queryRaw<{ month: string; users: bigint }[]>`
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YY') as month,
        COUNT(*)::bigint as users
      FROM users
      WHERE role = 'CUSTOMER' AND created_at >= ${sixMonthsAgo}
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at)
    `,
    prisma.$queryRaw<{ category: string; revenue: number }[]>`
      SELECT
        c.name as category,
        COALESCE(SUM(oi.price * oi.quantity), 0)::float as revenue
      FROM categories c
      JOIN products p ON p.category_id = c.id
      JOIN order_items oi ON oi.product_id = p.id
      JOIN orders o ON o.id = oi.order_id
      WHERE o.payment_status = 'PAID'
      GROUP BY c.name
      ORDER BY revenue DESC
    `,
  ]);

  // Fetch product names for top products
  const productIds = topProducts.map((p) => p.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, price: true, images: true },
  });
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

  return {
    revenueByMonth: revenueByMonth.map((r) => ({
      month: r.month,
      revenue: Number(r.revenue),
      orders: Number(r.orders),
    })),
    topProducts: topProducts.map((p) => ({
      ...p,
      product: productMap[p.productId],
      totalQty: p._sum.quantity ?? 0,
    })),
    ordersByStatus: ordersByStatus.map((o) => ({
      status: o.status,
      count: o._count,
    })),
    newUsersByMonth: newUsersByMonth.map((u) => ({
      month: u.month,
      users: Number(u.users),
    })),
    categoryRevenue: categoryRevenue.map((c) => ({
      category: c.category,
      revenue: Number(c.revenue),
    })),
  };
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();
  return <AnalyticsClient data={data} />;
}

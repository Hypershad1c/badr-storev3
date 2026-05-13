import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { DashboardOverview } from "./overview-client";

export const metadata: Metadata = {
  title: "Dashboard Overview",
};

async function getDashboardData() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalRevenue,
    lastMonthRevenue,
    ordersThisMonth,
    ordersLastMonth,
    totalCustomers,
    newCustomers,
    totalProducts,
    recentOrders,
    monthlyRevenue,
  ] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: "PAID", createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),

    prisma.payment.aggregate({
      where: {
        status: "PAID",
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { amount: true },
    }),

    prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),

    prisma.order.count({
      where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
    }),

    prisma.user.count({ where: { role: "CUSTOMER" } }),

    prisma.user.count({
      where: { role: "CUSTOMER", createdAt: { gte: startOfMonth } },
    }),

    prisma.product.count(),

    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    }),

    prisma.$queryRaw<
      { month: string; revenue: number; orders: bigint }[]
    >`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', p."createdAt"), 'Mon') as month,
        COALESCE(SUM(p.amount), 0) as revenue,
        COUNT(DISTINCT p."orderId") as orders
      FROM payments p
      WHERE p.status = 'PAID'
        AND p."createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', p."createdAt")
      ORDER BY DATE_TRUNC('month', p."createdAt")
    `,
  ]);

  return {
    stats: {
      revenue: totalRevenue._sum.amount ?? 0,
      revenueChange: 0,
      orders: ordersThisMonth,
      ordersChange: 0,
      customers: totalCustomers,
      customersChange: newCustomers,
      products: totalProducts,
    },
    recentOrders,
    monthlyRevenue: monthlyRevenue.map((r) => ({
      month: r.month,
      revenue: Number(r.revenue),
      orders: Number(r.orders),
    })),
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return <DashboardOverview data={data} />;
}
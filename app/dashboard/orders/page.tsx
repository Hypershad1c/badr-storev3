import { prisma } from "@/lib/prisma";
import { OrdersTable } from "./orders-table";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true } } } },
      address: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return <OrdersTable orders={orders} />;
}

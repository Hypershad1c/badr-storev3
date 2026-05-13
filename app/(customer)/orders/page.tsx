import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Package, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const statusVariant: Record<string, "default"|"secondary"|"destructive"|"outline"> = {
  PENDING: "secondary", CONFIRMED: "outline", PROCESSING: "outline",
  SHIPPED: "outline", DELIVERED: "default", CANCELLED: "destructive",
};

export default async function CustomerOrdersPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: { product: { select: { name: true, images: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-2xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <Package className="h-7 w-7 text-muted-foreground/40"/>
          </div>
          <h2 className="font-semibold text-lg">No orders yet</h2>
          <p className="text-muted-foreground text-sm">When you place orders, they'll appear here.</p>
          <Button asChild>
            <Link href="/shop">Start Shopping <ArrowRight className="ml-2 h-4 w-4"/></Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="font-semibold">Order #{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <Badge variant={statusVariant[order.status] ?? "secondary"}>
                      {order.status}
                    </Badge>
                    <p className="font-bold">{formatPrice(order.total)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        {item.product.images[0] && (
                          <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover"/>
                        )}
                      </div>
                      <p className="text-sm flex-1 line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">×{item.quantity}</p>
                      <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Payment:</span>
                    <Badge variant={order.paymentStatus === "PAID" ? "default" : "secondary"} className="text-xs">
                      {order.paymentStatus}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Shipping:</span>
                    <span className="text-xs font-medium">{order.shippingStatus.replace("_", " ")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

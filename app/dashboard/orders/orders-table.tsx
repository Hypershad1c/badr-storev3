"use client";

import { useState } from "react";
import { updateOrderStatus, updateShippingStatus } from "@/actions/orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { Search } from "lucide-react";
import toast from "react-hot-toast";
import type { Order, OrderItem, Product, User, Address, OrderStatus, ShippingStatus } from "@prisma/client";

type OrderWithRelations = Order & {
  user: Pick<User, "name" | "email">;
  items: (OrderItem & { product: Pick<Product, "name"> })[];
  address: Address | null;
};

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary", CONFIRMED: "outline", PROCESSING: "outline",
  SHIPPED: "outline", DELIVERED: "default", CANCELLED: "destructive", REFUNDED: "destructive",
};

export function OrdersTable({ orders }: { orders: OrderWithRelations[] }) {
  const [search, setSearch] = useState("");

  const filtered = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.user.email.toLowerCase().includes(search.toLowerCase()) ||
      o.user.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    await updateOrderStatus(orderId, status);
    toast.success("Order status updated");
  };

  const handleShippingChange = async (orderId: string, status: ShippingStatus) => {
    await updateShippingStatus(orderId, status);
    toast.success("Shipping status updated");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground">{orders.length} total orders</p>
      </div>
      <Card>
        <CardHeader className="pb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by ID or customer…" className="pl-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr>
                  {["Order", "Customer", "Items", "Total", "Status", "Payment", "Shipping", "Date"].map((h) => (
                    <th key={h} className="text-left font-medium px-4 py-3 text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">No orders found</td></tr>
                ) : filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold">#{order.id.slice(-8).toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.user.name}</p>
                      <p className="text-xs text-muted-foreground">{order.user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</td>
                    <td className="px-4 py-3 font-semibold">${order.total.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <Select defaultValue={order.status} onValueChange={(v) => handleStatusChange(order.id, v as OrderStatus)}>
                        <SelectTrigger className="h-7 w-32 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["PENDING","CONFIRMED","PROCESSING","SHIPPED","DELIVERED","CANCELLED"].map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={order.paymentStatus === "PAID" ? "default" : order.paymentStatus === "FAILED" ? "destructive" : "secondary"}>
                        {order.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Select defaultValue={order.shippingStatus} onValueChange={(v) => handleShippingChange(order.id, v as ShippingStatus)}>
                        <SelectTrigger className="h-7 w-36 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["NOT_SHIPPED","PREPARING","SHIPPED","IN_TRANSIT","DELIVERED","RETURNED"].map((s) => (
                            <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

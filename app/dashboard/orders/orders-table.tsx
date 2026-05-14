"use client";

import { useState } from "react";
import {
  updateOrderStatus,
  updateShippingStatus,
  deleteOrder,
  updateOrder,
} from "@/actions/orders";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { formatDate } from "@/lib/utils";

import {
  Search,
  Trash2,
  Pencil,
  Save,
  X,
} from "lucide-react";

import toast from "react-hot-toast";

import type {
  Order,
  OrderItem,
  Product,
  User,
  Address,
  OrderStatus,
  ShippingStatus,
  PaymentStatus,
} from "@prisma/client";

type OrderWithRelations = Order & {
  user: Pick<User, "name" | "email">;

  items: (OrderItem & {
    product: Pick<Product, "name">;
  })[];

  address: Address | null;
};

export function OrdersTable({
  orders,
}: {
  orders: OrderWithRelations[];
}) {
  const [search, setSearch] = useState("");

  const [editingOrderId, setEditingOrderId] =
    useState<string | null>(null);

  const [notes, setNotes] = useState("");

  const filtered = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.user.email
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      o.user.name
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );

  // ==========================
  // STATUS
  // ==========================
  const handleStatusChange = async (
    orderId: string,
    status: OrderStatus
  ) => {
    const res = await updateOrderStatus(orderId, status);

    if (res?.error) {
      toast.error(res.error);
      return;
    }

    toast.success("Order status updated");
  };

  // ==========================
  // SHIPPING
  // ==========================
  const handleShippingChange = async (
    orderId: string,
    status: ShippingStatus
  ) => {
    const res = await updateShippingStatus(orderId, status);

    if (res?.error) {
      toast.error(res.error);
      return;
    }

    toast.success("Shipping status updated");
  };

  // ==========================
  // DELETE
  // ==========================
  const handleDelete = async (orderId: string) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this order?"
    );

    if (!confirmDelete) return;

    const res = await deleteOrder(orderId);

    if (res?.error) {
      toast.error(res.error);
      return;
    }

    toast.success("Order deleted");
  };

  // ==========================
  // SAVE NOTES
  // ==========================
  const handleSaveNotes = async (orderId: string) => {
    const res = await updateOrder(orderId, {
      notes,
    });

    if (res?.error) {
      toast.error(res.error);
      return;
    }

    toast.success("Order updated");

    setEditingOrderId(null);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Orders
          </h1>

          <p className="text-sm text-muted-foreground">
            {orders.length} total orders
          </p>
        </div>
      </div>

      {/* TABLE */}
      <Card>
        <CardHeader className="pb-4">
          <div className="relative w-full max-w-sm">
            <Search
              className="absolute left-3 top-1/2
              -translate-y-1/2 h-4 w-4
              text-muted-foreground"
            />

            <Input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search by ID or customer…"
              className="pl-9"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr>
                  {[
                    "Order",
                    "Customer",
                    "Items",
                    "Total",
                    "Status",
                    "Payment",
                    "Shipping",
                    "Notes",
                    "Date",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left font-medium px-4 py-3 text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="text-center py-12 text-muted-foreground"
                    >
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filtered.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      {/* ORDER ID */}
                      <td className="px-4 py-3 font-mono text-xs font-semibold">
                        #
                        {order.id
                          .slice(-8)
                          .toUpperCase()}
                      </td>

                      {/* CUSTOMER */}
                      <td className="px-4 py-3">
                        <p className="font-medium">
                          {order.user.name}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {order.user.email}
                        </p>
                      </td>

                      {/* ITEMS */}
                      <td className="px-4 py-3 text-muted-foreground">
                        {order.items.length} item
                        {order.items.length !== 1
                          ? "s"
                          : ""}
                      </td>

                      {/* TOTAL */}
                      <td className="px-4 py-3 font-semibold">
                        ${order.total.toFixed(2)}
                      </td>

                      {/* STATUS */}
                      <td className="px-4 py-3">
                        <Select
                          defaultValue={order.status}
                          onValueChange={(v) =>
                            handleStatusChange(
                              order.id,
                              v as OrderStatus
                            )
                          }
                        >
                          <SelectTrigger className="h-8 w-36 text-xs">
                            <SelectValue />
                          </SelectTrigger>

                          <SelectContent>
                            {[
                              "PENDING",
                              "CONFIRMED",
                              "PROCESSING",
                              "SHIPPED",
                              "DELIVERED",
                              "CANCELLED",
                              "REFUNDED",
                            ].map((s) => (
                              <SelectItem
                                key={s}
                                value={s}
                              >
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>

                      {/* PAYMENT */}
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            order.paymentStatus ===
                            "PAID"
                              ? "default"
                              : order.paymentStatus ===
                                "FAILED"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {order.paymentStatus}
                        </Badge>
                      </td>

                      {/* SHIPPING */}
                      <td className="px-4 py-3">
                        <Select
                          defaultValue={
                            order.shippingStatus
                          }
                          onValueChange={(v) =>
                            handleShippingChange(
                              order.id,
                              v as ShippingStatus
                            )
                          }
                        >
                          <SelectTrigger className="h-8 w-40 text-xs">
                            <SelectValue />
                          </SelectTrigger>

                          <SelectContent>
                            {[
                              "NOT_SHIPPED",
                              "PREPARING",
                              "SHIPPED",
                              "IN_TRANSIT",
                              "DELIVERED",
                              "RETURNED",
                            ].map((s) => (
                              <SelectItem
                                key={s}
                                value={s}
                              >
                                {s.replace("_", " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>

                      {/* NOTES */}
                      <td className="px-4 py-3 min-w-[250px]">
                        {editingOrderId === order.id ? (
                          <div className="flex gap-2">
                            <Input
                              value={notes}
                              onChange={(e) =>
                                setNotes(
                                  e.target.value
                                )
                              }
                              placeholder="Order notes..."
                            />

                            <Button
                              size="icon"
                              onClick={() =>
                                handleSaveNotes(
                                  order.id
                                )
                              }
                            >
                              <Save className="h-4 w-4" />
                            </Button>

                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() =>
                                setEditingOrderId(
                                  null
                                )
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                              {order.notes ||
                                "No notes"}
                            </p>

                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setEditingOrderId(
                                  order.id
                                );

                                setNotes(
                                  order.notes || ""
                                );
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </td>

                      {/* DATE */}
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-4 py-3">
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() =>
                            handleDelete(order.id)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
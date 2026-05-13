"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DashboardOverviewProps {
  data: {
    stats: {
      revenue: number;
      revenueChange: number;
      orders: number;
      ordersChange: number;
      customers: number;
      customersChange: number;
      products: number;
    };
    recentOrders: Array<{
      id: string;
      total: number;
      status: string;
      createdAt: Date;
      user: { name: string | null; email: string };
    }>;
    monthlyRevenue: Array<{ month: string; revenue: number; orders: number }>;
  };
}

const statCards = (stats: DashboardOverviewProps["data"]["stats"]) => [
  {
    title: "Revenue (Month)",
    value: `$${stats.revenue.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    change: stats.revenueChange,
    icon: DollarSign,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    title: "Orders (Month)",
    value: stats.orders.toString(),
    change: stats.ordersChange,
    icon: ShoppingCart,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Total Customers",
    value: stats.customers.toString(),
    change: stats.customersChange,
    icon: Users,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    suffix: `+${stats.customersChange} new`,
  },
  {
    title: "Total Products",
    value: stats.products.toString(),
    icon: Package,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
];

const statusColors: Record<string, string> = {
  PENDING: "secondary",
  CONFIRMED: "outline",
  PROCESSING: "outline",
  SHIPPED: "outline",
  DELIVERED: "default",
  CANCELLED: "destructive",
};

export function DashboardOverview({ data }: DashboardOverviewProps) {
  const { stats, recentOrders, monthlyRevenue } = data;
  const cards = statCards(stats);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Welcome back! Here's what's happening with your store.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <div className={cn("p-2 rounded-lg", card.bg)}>
                    <card.icon className={cn("h-4 w-4", card.color)} />
                  </div>
                </div>
                <p className="text-2xl font-bold">{card.value}</p>
                {card.change !== undefined && (
                  <div className="flex items-center gap-1 mt-1">
                    {card.change >= 0 ? (
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                    )}
                    <span
                      className={cn(
                        "text-xs font-medium",
                        card.change >= 0 ? "text-emerald-500" : "text-destructive"
                      )}
                    >
                      {card.change >= 0 ? "+" : ""}
                      {card.change.toFixed(1)}% vs last month
                    </span>
                  </div>
                )}
                {card.suffix && (
                  <p className="text-xs text-muted-foreground mt-1">{card.suffix}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]}
                    contentStyle={{
                      background: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-60 flex items-center justify-center text-muted-foreground text-sm">
                No revenue data yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Orders by Month</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-60 flex items-center justify-center text-muted-foreground text-sm">
                No order data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left font-medium pb-3 pr-4">Order</th>
                    <th className="text-left font-medium pb-3 pr-4">Customer</th>
                    <th className="text-left font-medium pb-3 pr-4">Status</th>
                    <th className="text-right font-medium pb-3">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                        #{order.id.slice(-8).toUpperCase()}
                      </td>
                      <td className="py-3 pr-4">
                        <div>
                          <p className="font-medium">{order.user.name}</p>
                          <p className="text-xs text-muted-foreground">{order.user.email}</p>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={(statusColors[order.status] as any) || "secondary"}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right font-semibold">
                        ${order.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Package } from "lucide-react";

const COLORS = ["#0f172a","#334155","#64748b","#94a3b8","#cbd5e1"];

interface AnalyticsClientProps {
  data: {
    revenueByMonth: { month: string; revenue: number; orders: number }[];
    topProducts: {
      productId: string;
      totalQty: number;
      product?: { id: string; name: string; price: number; images: string[] };
    }[];
    ordersByStatus: { status: string; count: number }[];
    newUsersByMonth: { month: string; users: number }[];
    categoryRevenue: { category: string; revenue: number }[];
  };
}

export function AnalyticsClient({ data }: AnalyticsClientProps) {
  const totalRevenue = data.revenueByMonth.reduce((s, r) => s + r.revenue, 0);
  const totalOrders  = data.revenueByMonth.reduce((s, r) => s + r.orders, 0);
  const totalUsers   = data.newUsersByMonth.reduce((s, u) => s + u.users, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Last 6 months performance overview</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Revenue", value: `$${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
          { label: "Total Orders",  value: totalOrders.toString() },
          { label: "New Customers", value: totalUsers.toString() },
        ].map((k) => (
          <Card key={k.label}>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-1">{k.label}</p>
              <p className="text-3xl font-bold">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue + Orders over time */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Revenue Over Time</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data.revenueByMonth}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                <XAxis dataKey="month" tick={{ fontSize: 11 }}/>
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`}/>
                <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]}
                  contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}/>
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#revGrad)"/>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Orders Over Time</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                <XAxis dataKey="month" tick={{ fontSize: 11 }}/>
                <YAxis tick={{ fontSize: 11 }}/>
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}/>
                <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* New users + Order status */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">New Customers</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.newUsersByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                <XAxis dataKey="month" tick={{ fontSize: 11 }}/>
                <YAxis tick={{ fontSize: 11 }}/>
                <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}/>
                <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }}/>
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Orders by Status</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            {data.ordersByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={data.ordersByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {data.ordersByStatus.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]}/>
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm py-12">No order data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category revenue + Top products */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Revenue by Category</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.categoryRevenue} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`}/>
                <YAxis dataKey="category" type="category" tick={{ fontSize: 11 }} width={90}/>
                <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]}
                  contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}/>
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0,4,4,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Top Selling Products</CardTitle></CardHeader>
          <CardContent>
            {data.topProducts.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">No sales data yet</p>
            ) : (
              <div className="space-y-3">
                {data.topProducts.map((item, i) => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                    <div className="relative h-9 w-9 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      {item.product?.images[0] ? (
                        <Image src={item.product.images[0]} alt="" fill className="object-cover"/>
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package className="h-3.5 w-3.5 text-muted-foreground/40"/>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.product?.name ?? "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">${item.product?.price.toFixed(2)}</p>
                    </div>
                    <span className="text-sm font-semibold">{item.totalQty} sold</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

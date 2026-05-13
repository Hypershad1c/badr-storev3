"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingCart,
  Users,
  BarChart3,
  Zap,
  Mail,
  Settings,
  ActivitySquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Role } from "@prisma/client";

const adminLinks = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview", exact: true },
  { href: "/dashboard/products", icon: Package, label: "Products" },
  { href: "/dashboard/categories", icon: Tag, label: "Categories" },
  { href: "/dashboard/orders", icon: ShoppingCart, label: "Orders" },
  { href: "/dashboard/virtual-requests", icon: Zap, label: "Services" },
  { href: "/dashboard/users", icon: Users, label: "Users", adminOnly: true },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/emails", icon: Mail, label: "Emails" },
  { href: "/dashboard/activity-logs", icon: ActivitySquare, label: "Activity", adminOnly: true },
  { href: "/dashboard/settings", icon: Settings, label: "Settings", adminOnly: true },
];

interface DashboardSidebarProps {
  role: Role;
}

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isAdmin = role === "ADMIN";
  const links = adminLinks.filter((l) => !l.adminOnly || isAdmin);

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4 shrink-0">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2 font-bold">
            <div className="h-7 w-7 rounded-lg bg-foreground flex items-center justify-center flex-shrink-0">
              <span className="text-background text-sm font-black">A</span>
            </div>
            <span>Apex</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/">
            <div className="h-7 w-7 rounded-lg bg-foreground flex items-center justify-center mx-auto">
              <span className="text-background text-sm font-black">A</span>
            </div>
          </Link>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 py-3 border-b">
          <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-primary/10 text-primary">
            {role === "ADMIN" ? "Administrator" : "Business Manager"}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-0.5">
          {links.map((link) => {
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  title={collapsed ? link.label : undefined}
                >
                  <link.icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span>{link.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse button */}
      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("w-full", collapsed ? "justify-center px-0" : "justify-end")}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}

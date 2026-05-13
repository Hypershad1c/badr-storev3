"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { SlidersHorizontal, Search, X } from "lucide-react";
import { ProductCard } from "@/components/shop/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { ProductWithCategory } from "@/types";
import type { Category } from "@prisma/client";
import { useState } from "react";
import Link from "next/link";

interface ShopClientPageProps {
  products: ProductWithCategory[];
  categories: Category[];
  total: number;
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}

export function ShopClientPage({
  products,
  categories,
  total,
  page,
  totalPages,
  searchParams,
}: ShopClientPageProps) {
  const router = useRouter();
  const [search, setSearch] = useState(searchParams.q || "");

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v && k !== key && k !== "page") params.set(k, v);
    });
    if (value) params.set(key, value);
    router.push(`/shop?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam("q", search || null);
  };

  const activeFilters = [
    searchParams.category && { key: "category", label: searchParams.category },
    searchParams.type && { key: "type", label: searchParams.type },
    searchParams.q && { key: "q", label: `"${searchParams.q}"` },
  ].filter(Boolean) as { key: string; label: string }[];

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Shop</h1>
        <p className="text-muted-foreground">{total} products available</p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-3 items-center mb-8 p-4 rounded-xl border bg-card">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-64">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="outline">Search</Button>
        </form>

        {/* Category filter */}
        <Select
          value={searchParams.category || "all"}
          onValueChange={(v) => updateParam("category", v === "all" ? null : v)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Type filter */}
        <Select
          value={searchParams.type || "all"}
          onValueChange={(v) => updateParam("type", v === "all" ? null : v)}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="PHYSICAL">Physical</SelectItem>
            <SelectItem value="VIRTUAL">Digital</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select
          value={searchParams.sort || "featured"}
          onValueChange={(v) => updateParam("sort", v)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {activeFilters.map((filter) => (
            <Badge key={filter.key} variant="secondary" className="gap-1 pr-1">
              {filter.label}
              <button
                onClick={() => updateParam(filter.key, null)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={() => router.push("/shop")}
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">No products found</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/shop">Clear filters</Link>
          </Button>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          {page > 1 && (
            <Button
              variant="outline"
              onClick={() => updateParam("page", String(page - 1))}
            >
              Previous
            </Button>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              onClick={() => updateParam("page", String(p))}
              className="h-9 w-9 p-0"
            >
              {p}
            </Button>
          ))}
          {page < totalPages && (
            <Button
              variant="outline"
              onClick={() => updateParam("page", String(page + 1))}
            >
              Next
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

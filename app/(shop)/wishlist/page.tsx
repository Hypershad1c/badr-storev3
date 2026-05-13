"use client";

import { useEffect, useState } from "react";
import { useWishlistStore } from "@/store/wishlist";
import { useCartStore } from "@/store/cart";
import { ProductCard } from "@/components/shop/product-card";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ProductWithCategory } from "@/types";

export default function WishlistPage() {
  const { items: wishlistIds } = useWishlistStore();
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wishlistIds.length === 0) { setLoading(false); return; }
    fetch(`/api/products?ids=${wishlistIds.join(",")}`)
      .then((r) => r.json())
      .then((d) => { setProducts(d.data ?? []); setLoading(false); });
  }, [wishlistIds]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-8">Wishlist</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton aspect-square rounded-xl"/>
          ))}
        </div>
      </div>
    );
  }

  if (wishlistIds.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
          <Heart className="h-8 w-8 text-muted-foreground/40"/>
        </div>
        <h1 className="text-2xl font-bold">Your wishlist is empty</h1>
        <p className="text-muted-foreground">Save products you love to your wishlist</p>
        <Button asChild>
          <Link href="/shop">Browse Products <ArrowRight className="ml-2 h-4 w-4"/></Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Wishlist ({wishlistIds.length})</h1>
        <Button asChild variant="outline">
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((p) => <ProductCard key={p.id} product={p}/>)}
      </div>
    </div>
  );
}

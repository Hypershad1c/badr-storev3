"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag, Heart, Star, Check, ChevronLeft, Zap, Package, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/shop/product-card";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import Link from "next/link";
import type { ProductWithCategory } from "@/types";
import type { Review, User } from "@prisma/client";

type ReviewWithUser = Review & { user: Pick<User, "name" | "avatar"> };
type ProductDetail = ProductWithCategory & { reviews: ReviewWithUser[] };

interface ProductDetailClientProps {
  product: ProductDetail;
  relatedProducts: ProductWithCategory[];
}

export function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const { addItem } = useCartStore();
  const { toggle, isInWishlist } = useWishlistStore();
  const inWishlist = isInWishlist(product.id);

  const variants = product.variants as { colors?: { name: string; value: string }[]; sizes?: string[] } | null;
  const avgRating = product.reviews.length
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : null;
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null;

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${JSON.stringify(selectedVariants)}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] ?? "",
      quantity,
      stock: product.stock,
      type: product.type,
      variant: Object.keys(selectedVariants).length ? selectedVariants : undefined,
    });
    toast.success("Added to cart!");
  };

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/shop" className="hover:text-foreground flex items-center gap-1">
          <ChevronLeft className="h-3.5 w-3.5" /> Shop
        </Link>
        <span>/</span>
        <Link href={`/categories#${product.category.slug}`} className="hover:text-foreground">
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12 mb-20">
        {/* Image Gallery */}
        <div className="space-y-3">
          <motion.div
            key={activeImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative aspect-square rounded-2xl overflow-hidden bg-muted"
          >
            {product.images[activeImage] ? (
              <Image
                src={product.images[activeImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
              </div>
            )}
            {discount && (
              <Badge variant="destructive" className="absolute top-4 left-4">-{discount}%</Badge>
            )}
          </motion.div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all",
                    i === activeImage ? "border-foreground" : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{product.category.name}</p>
              <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
            </div>
            <button onClick={() => toggle(product.id)} className="p-2 rounded-full border hover:bg-muted">
              <Heart className={cn("h-5 w-5", inWishlist && "fill-red-500 text-red-500")} />
            </button>
          </div>

          {/* Rating */}
          {avgRating && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={cn("h-4 w-4", s <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
                ))}
              </div>
              <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">({product.reviews.length} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-bold">${product.price.toFixed(2)}</span>
            {product.comparePrice && (
              <span className="text-xl text-muted-foreground line-through">${product.comparePrice.toFixed(2)}</span>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed mb-6">{product.shortDescription ?? product.description.slice(0, 200)}</p>
          <Separator className="mb-6" />

          {/* Color Variants */}
          {variants?.colors && (
            <div className="mb-5">
              <p className="text-sm font-semibold mb-2">
                Color: <span className="font-normal text-muted-foreground">{selectedVariants.color || "Select"}</span>
              </p>
              <div className="flex gap-2">
                {variants.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedVariants((p) => ({ ...p, color: c.name }))}
                    title={c.name}
                    className={cn(
                      "h-8 w-8 rounded-full border-2 transition-all",
                      selectedVariants.color === c.name ? "border-foreground scale-110" : "border-transparent"
                    )}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Variants */}
          {variants?.sizes && (
            <div className="mb-6">
              <p className="text-sm font-semibold mb-2">
                Size: <span className="font-normal text-muted-foreground">{selectedVariants.size || "Select"}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {variants.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedVariants((p) => ({ ...p, size: s }))}
                    className={cn(
                      "h-9 min-w-[2.25rem] px-3 rounded-lg border text-sm font-medium transition-all",
                      selectedVariants.size === s
                        ? "bg-foreground text-background border-foreground"
                        : "hover:border-foreground"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + Add to Cart */}
          {product.type === "PHYSICAL" ? (
            <div className="flex gap-3 mb-6">
              <div className="flex items-center border rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-muted transition-colors">-</button>
                <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-3 py-2 hover:bg-muted transition-colors">+</button>
              </div>
              <Button onClick={handleAddToCart} className="flex-1 h-11" disabled={product.stock === 0}>
                <ShoppingBag className="mr-2 h-4 w-4" />
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
            </div>
          ) : (
            <Button asChild className="w-full h-11 mb-6">
              <Link href={`/checkout?service=${product.id}`}>
                <Zap className="mr-2 h-4 w-4" /> Request This Service
              </Link>
            </Button>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Shield, label: "Secure payment" },
              { icon: Package, label: "Fast delivery" },
              { icon: Check, label: "Quality guarantee" },
            ].map((b) => (
              <div key={b.label} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-muted/50 text-center">
                <b.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      {product.reviews.length > 0 && (
        <div className="mb-20">
          <h2 className="text-2xl font-bold mb-6">Reviews ({product.reviews.length})</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="p-5 rounded-xl border bg-card">
                <div className="flex items-center gap-1 mb-2">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={cn("h-3.5 w-3.5", s <= review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{review.comment}</p>
                <p className="text-xs font-medium">{review.user.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { cn } from "@/lib/utils";
import type { ProductWithCategory } from "@/types";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: ProductWithCategory;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { toggle, isInWishlist } = useWishlistStore();
  const inWishlist = isInWishlist(product.id);
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) return;

    addItem({
      id: `${product.id}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] ?? "",
      quantity: 1,
      stock: product.stock,
      type: product.type,
    });
    toast.success("Added to cart");
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
    toast.success(inWishlist ? "Removed from wishlist" : "Added to wishlist");
  };

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn("group relative", className)}
    >
      <Link href={`/product/${product.slug}`}>
        <div className="relative overflow-hidden rounded-xl border bg-card">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-muted">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {discount && discount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  -{discount}%
                </Badge>
              )}
              {product.type === "VIRTUAL" && (
                <Badge className="text-xs bg-foreground text-background">
                  <Zap className="mr-1 h-2.5 w-2.5" /> Digital
                </Badge>
              )}
              {product.featured && (
                <Badge variant="outline" className="text-xs bg-background/80 backdrop-blur-sm">
                  Featured
                </Badge>
              )}
            </div>

            {/* Wishlist button */}
            <button
              onClick={handleWishlist}
              className={cn(
                "absolute top-3 right-3 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center border transition-all",
                "opacity-0 group-hover:opacity-100",
                inWishlist && "opacity-100"
              )}
            >
              <Heart
                className={cn("h-3.5 w-3.5 transition-colors", inWishlist && "fill-red-500 text-red-500")}
              />
            </button>

            {/* Out of stock overlay */}
            {product.stock === 0 && product.type === "PHYSICAL" && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                <Badge variant="secondary">Out of Stock</Badge>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-4">
            <p className="text-xs text-muted-foreground mb-1">{product.category.name}</p>
            <h3 className="font-semibold text-sm leading-tight mb-2 line-clamp-2">
              {product.name}
            </h3>

            {/* Rating */}
            {avgRating && (
              <div className="flex items-center gap-1 mb-3">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="text-xs font-medium">{avgRating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">
                  ({product.reviews.length})
                </span>
              </div>
            )}

            {/* Price + Add to cart */}
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold">${product.price.toFixed(2)}</span>
                {product.comparePrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    ${product.comparePrice.toFixed(2)}
                  </span>
                )}
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={handleAddToCart}
                disabled={product.stock === 0 && product.type === "PHYSICAL"}
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const total = getTotalPrice();

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
          <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="text-muted-foreground">Add some products to get started</p>
        <Button asChild>
          <Link href="/shop">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <h1 className="text-2xl font-bold mb-8">Shopping Cart ({items.length})</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={`${item.productId}-${JSON.stringify(item.variant)}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, height: 0 }}
                className="flex gap-4 p-4 rounded-xl border bg-card"
              >
                <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold leading-tight mb-1">{item.name}</h3>
                  {item.variant && (
                    <p className="text-xs text-muted-foreground mb-2">
                      {Object.entries(item.variant).map(([k, v]) => `${k}: ${v}`).join(", ")}
                    </p>
                  )}
                  <p className="font-bold text-lg">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button onClick={() => removeItem(item.productId, item.variant)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="flex items-center border rounded-lg">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variant)} className="px-2 py-1.5 hover:bg-muted">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="px-3 text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variant)} disabled={item.quantity >= item.stock} className="px-2 py-1.5 hover:bg-muted disabled:opacity-50">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="p-6 rounded-xl border bg-card h-fit">
          <h2 className="font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span><span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span><span className="text-emerald-600">Free</span>
            </div>
          </div>
          <Separator className="mb-4" />
          <div className="flex justify-between font-bold text-lg mb-6">
            <span>Total</span><span>${total.toFixed(2)}</span>
          </div>
          <Button asChild className="w-full h-11">
            <Link href="/checkout">
              Checkout <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full mt-2">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

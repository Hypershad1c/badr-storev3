"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCartStore } from "@/store/cart";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Loader2, Lock, Tag } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { items, getTotalPrice } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const router = useRouter();
  const subtotal = getTotalPrice();
  const total = Math.max(0, subtotal - discount);

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
  });

  // FIX 1: Wrap navigation in useEffect to avoid "setState during render" error
  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items, router]);

  // Prevent rendering if cart is empty while redirecting
  if (items.length === 0) {
    return null;
  }

  const applyCoupon = async () => {
    if (!coupon) return;
    try {
      const res = await fetch(`/api/coupons/validate?code=${coupon}&total=${subtotal}`);
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
        return;
      }
      setDiscount(data.discount);
      toast.success(`Coupon applied! -$${data.discount.toFixed(2)}`);
    } catch (err) {
      toast.error("Failed to validate coupon");
    }
  };

  const onSubmit = async (data: CheckoutInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shippingAddress: data,
          couponCode: coupon || undefined,
        }),
      });
      
      const result = await res.json();
      
      if (result.error) {
        toast.error(result.error);
        setLoading(false);
        return;
      }

      // FIX 2: Use router.push for the Stripe redirect to prevent "location is not defined" build errors
      if (result.url) {
        router.push(result.url);
      }
    } catch (err) {
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>
      <div className="grid lg:grid-cols-5 gap-10">
        {/* Form */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="p-6 rounded-xl border bg-card">
              <h2 className="font-semibold mb-4">Shipping Address</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>First Name</Label>
                  <Input {...register("firstName")} placeholder="Jane" />
                  {errors.firstName && <p className="text-destructive text-xs">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Last Name</Label>
                  <Input {...register("lastName")} placeholder="Smith" />
                  {errors.lastName && <p className="text-destructive text-xs">{errors.lastName.message}</p>}
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label>Email</Label>
                  <Input type="email" {...register("email")} placeholder="you@example.com" />
                  {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label>Phone (optional)</Label>
                  <Input {...register("phone")} placeholder="+1 555 000 1234" />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label>Address Line 1</Label>
                  <Input {...register("line1")} placeholder="123 Main Street" />
                  {errors.line1 && <p className="text-destructive text-xs">{errors.line1.message}</p>}
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label>Address Line 2 (optional)</Label>
                  <Input {...register("line2")} placeholder="Apt, suite, floor…" />
                </div>
                <div className="space-y-1.5">
                  <Label>City</Label>
                  <Input {...register("city")} placeholder="San Francisco" />
                  {errors.city && <p className="text-destructive text-xs">{errors.city.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>State / Province</Label>
                  <Input {...register("state")} placeholder="CA" />
                </div>
                <div className="space-y-1.5">
                  <Label>Postal Code</Label>
                  <Input {...register("postalCode")} placeholder="94102" />
                  {errors.postalCode && <p className="text-destructive text-xs">{errors.postalCode.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Country</Label>
                  <Input {...register("country")} placeholder="United States" />
                  {errors.country && <p className="text-destructive text-xs">{errors.country.message}</p>}
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
              Pay ${total.toFixed(2)} Securely
            </Button>
            <p className="text-xs text-center text-muted-foreground">Powered by Stripe. Your payment info is secure.</p>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-xl border bg-card">
            <h2 className="font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={`${item.productId}-${JSON.stringify(item.variant)}`} className="flex gap-3">
                  <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <Separator className="my-4" />

            {/* Coupon */}
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input 
                  value={coupon} 
                  onChange={(e) => setCoupon(e.target.value.toUpperCase())} 
                  placeholder="COUPON CODE" 
                  className="pl-8 text-xs" 
                />
              </div>
              <Button variant="outline" size="sm" onClick={applyCoupon} type="button">Apply</Button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span><span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span><span className="text-emerald-600">Free</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-base pt-1">
                <span>Total</span><span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            🔒 256-bit SSL encryption. Safe & secure checkout.
          </div>
        </div>
      </div>
    </div>
  );
}
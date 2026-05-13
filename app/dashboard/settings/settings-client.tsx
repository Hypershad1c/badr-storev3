"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { couponSchema, type CouponInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Tag, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import type { Coupon } from "@prisma/client";

interface SettingsClientProps {
  userId: string;
  coupons: Coupon[];
}

export function SettingsClient({ coupons: initialCoupons }: SettingsClientProps) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<CouponInput>({
    resolver: zodResolver(couponSchema),
    defaultValues: { discountType: "PERCENTAGE", active: true },
  });

  const discountType = watch("discountType");

  const onSubmit = async (data: CouponInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error || "Failed"); return; }
      setCoupons((prev) => [json.data, ...prev]);
      toast.success("Coupon created!");
      setDialogOpen(false);
      reset();
    } finally {
      setLoading(false);
    }
  };

  const deleteCoupon = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    const res = await fetch(`/api/coupons/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      toast.success("Coupon deleted");
    } else {
      toast.error("Failed to delete");
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    const res = await fetch(`/api/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    if (res.ok) {
      setCoupons((prev) => prev.map((c) => c.id === id ? { ...c, active } : c));
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage store configuration</p>
      </div>

      {/* Coupons */}
      <Card>
        <CardHeader className="flex-row items-center justify-between pb-4">
          <CardTitle className="text-base">Discount Coupons</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-2 h-3.5 w-3.5"/>New Coupon</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Coupon</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Code</Label>
                  <Input {...register("code")} placeholder="SUMMER20" className="uppercase"/>
                  {errors.code && <p className="text-destructive text-xs">{errors.code.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Discount Amount</Label>
                    <Input type="number" step="0.01" {...register("discount")} placeholder="20"/>
                    {errors.discount && <p className="text-destructive text-xs">{errors.discount.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Type</Label>
                    <Select defaultValue="PERCENTAGE" onValueChange={(v) => setValue("discountType", v as "PERCENTAGE"|"FIXED")}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                        <SelectItem value="FIXED">Fixed ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Min. Order ($)</Label>
                    <Input type="number" step="0.01" {...register("minOrderAmount")} placeholder="Optional"/>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Max Uses</Label>
                    <Input type="number" {...register("maxUses")} placeholder="Optional"/>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Expiration Date</Label>
                  <Input type="date" {...register("expirationDate")}/>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                  Create Coupon
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {coupons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Tag className="h-8 w-8 mx-auto mb-2 opacity-30"/>
              <p className="text-sm">No coupons yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {coupons.map((coupon) => (
                <div key={coupon.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <code className="text-sm font-bold bg-muted px-2 py-0.5 rounded">{coupon.code}</code>
                    <Badge variant="outline" className="text-xs">
                      {coupon.discountType === "PERCENTAGE"
                        ? `${coupon.discount}% off`
                        : `$${coupon.discount} off`}
                    </Badge>
                    {coupon.minOrderAmount && (
                      <span className="text-xs text-muted-foreground">min ${coupon.minOrderAmount}</span>
                    )}
                    {coupon.expirationDate && (
                      <span className="text-xs text-muted-foreground">
                        expires {formatDate(coupon.expirationDate)}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">{coupon.usedCount} uses</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={coupon.active}
                      onCheckedChange={(v) => toggleActive(coupon.id, v)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteCoupon(coupon.id, coupon.code)}
                    >
                      <Trash2 className="h-3.5 w-3.5"/>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Store info placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Store Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Store Name</Label>
              <Input defaultValue="Apex Store" readOnly className="bg-muted/40"/>
            </div>
            <div className="space-y-1.5">
              <Label>Support Email</Label>
              <Input defaultValue="support@apexstore.com" readOnly className="bg-muted/40"/>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Store settings are managed via environment variables. Update your <code>.env</code> file to change these values.</p>
        </CardContent>
      </Card>
    </div>
  );
}

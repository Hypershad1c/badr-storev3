"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductInput } from "@/lib/validations";
import { createProduct, updateProduct } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, X } from "lucide-react";
import { useState, useRef } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import type { Product, Category } from "@prisma/client";

interface ProductFormProps {
  categories: Category[];
  product?: Product | null;
  onSuccess: () => void;
}

export function ProductForm({ categories, product, onSuccess }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      shortDescription: product?.shortDescription ?? "",
      price: product?.price ?? 0,
      comparePrice: product?.comparePrice ?? undefined,
      stock: product?.stock ?? 0,
      sku: product?.sku ?? "",
      featured: product?.featured ?? false,
      type: product?.type ?? "PHYSICAL",
      categoryId: product?.categoryId ?? "",
      images: product?.images ?? [],
    },
  });

  const featured = watch("featured");
  const type = watch("type");

  const handleImageUpload = async (files: FileList) => {
    setUploadingImages(true);
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    fd.append("folder", "products");

    const res = await fetch("/api/uploads", { method: "POST", body: fd });
    const data = await res.json();
    if (data.urls) {
      const newImages = [...images, ...data.urls];
      setImages(newImages);
      setValue("images", newImages);
      toast.success("Images uploaded!");
    } else {
      toast.error("Upload failed");
    }
    setUploadingImages(false);
  };

  const removeImage = (idx: number) => {
    const newImages = images.filter((_, i) => i !== idx);
    setImages(newImages);
    setValue("images", newImages);
  };

  const onSubmit = async (data: ProductInput) => {
    setLoading(true);
    const result = product
      ? await updateProduct(product.id, { ...data, images })
      : await createProduct({ ...data, images });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(product ? "Product updated!" : "Product created!");
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label>Name</Label>
          <Input {...register("name")} placeholder="Product name" />
          {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Price ($)</Label>
          <Input type="number" step="0.01" {...register("price")} />
          {errors.price && <p className="text-destructive text-xs">{errors.price.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Compare Price ($)</Label>
          <Input type="number" step="0.01" {...register("comparePrice")} placeholder="Original price" />
        </div>

        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select defaultValue={product?.categoryId} onValueChange={(v) => setValue("categoryId", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryId && <p className="text-destructive text-xs">{errors.categoryId.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select defaultValue={product?.type ?? "PHYSICAL"} onValueChange={(v) => setValue("type", v as "PHYSICAL" | "VIRTUAL")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PHYSICAL">Physical</SelectItem>
              <SelectItem value="VIRTUAL">Virtual / Digital</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {type === "PHYSICAL" && (
          <>
            <div className="space-y-1.5">
              <Label>Stock</Label>
              <Input type="number" {...register("stock")} />
            </div>
            <div className="space-y-1.5">
              <Label>SKU</Label>
              <Input {...register("sku")} placeholder="e.g. APX-HP-001" />
            </div>
          </>
        )}

        <div className="col-span-2 space-y-1.5">
          <Label>Short Description</Label>
          <Input {...register("shortDescription")} placeholder="Brief tagline shown in listings" />
        </div>

        <div className="col-span-2 space-y-1.5">
          <Label>Description</Label>
          <Textarea {...register("description")} rows={4} placeholder="Full product description" />
          {errors.description && <p className="text-destructive text-xs">{errors.description.message}</p>}
        </div>
      </div>

      {/* Images */}
      <div className="space-y-3">
        <Label>Images</Label>
        <div
          className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {uploadingImages ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
            </div>
          ) : (
            <div className="text-muted-foreground">
              <Upload className="h-6 w-6 mx-auto mb-2" />
              <p className="text-sm">Click or drag images to upload</p>
            </div>
          )}
        </div>
        <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => e.target.files && handleImageUpload(e.target.files)} />
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {images.map((url, idx) => (
              <div key={idx} className="relative h-16 w-16 rounded-lg overflow-hidden group">
                <Image src={url} alt="" fill className="object-cover" />
                <button type="button" onClick={() => removeImage(idx)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
        {errors.images && <p className="text-destructive text-xs">{errors.images.message}</p>}
      </div>

      {/* Featured */}
      <div className="flex items-center justify-between p-4 rounded-xl border">
        <div>
          <p className="font-medium text-sm">Featured Product</p>
          <p className="text-xs text-muted-foreground">Show on homepage and in featured sections</p>
        </div>
        <Switch checked={featured} onCheckedChange={(v) => setValue("featured", v)} />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {product ? "Update Product" : "Create Product"}
      </Button>
    </form>
  );
}

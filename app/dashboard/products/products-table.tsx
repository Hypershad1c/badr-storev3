"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Star, Package, Zap, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { ProductForm } from "./product-form";
import { deleteProduct, toggleProductFeatured } from "@/actions/products";
import { Switch } from "@/components/ui/switch";
import toast from "react-hot-toast";
import type { Product, Category } from "@prisma/client";

type ProductWithCategory = Product & { category: Category };

interface ProductsTableProps {
  products: ProductWithCategory[];
  categories: Category[];
}

export function ProductsTable({ products, categories }: ProductsTableProps) {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithCategory | null>(null);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const result = await deleteProduct(id);
    if (result.success) toast.success("Product deleted");
    else toast.error(result.error || "Failed to delete");
  };

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    await toggleProductFeatured(id, featured);
    toast.success(featured ? "Product featured" : "Product unfeatured");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">{products.length} total products</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingProduct(null)}>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
            </DialogHeader>
            <ProductForm
              categories={categories}
              product={editingProduct}
              onSuccess={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="text-left font-medium px-6 py-3 text-muted-foreground">Product</th>
                  <th className="text-left font-medium px-4 py-3 text-muted-foreground">Category</th>
                  <th className="text-left font-medium px-4 py-3 text-muted-foreground">Type</th>
                  <th className="text-right font-medium px-4 py-3 text-muted-foreground">Price</th>
                  <th className="text-right font-medium px-4 py-3 text-muted-foreground">Stock</th>
                  <th className="text-center font-medium px-4 py-3 text-muted-foreground">Featured</th>
                  <th className="text-right font-medium px-6 py-3 text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground">
                      No products found
                    </td>
                  </tr>
                ) : (
                  filtered.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            {product.images[0] ? (
                              <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Package className="h-4 w-4 text-muted-foreground/50" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium line-clamp-1">{product.name}</p>
                            {product.sku && <p className="text-xs text-muted-foreground">{product.sku}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">{product.category.name}</td>
                      <td className="px-4 py-4">
                        <Badge variant={product.type === "VIRTUAL" ? "default" : "secondary"} className="gap-1">
                          {product.type === "VIRTUAL" ? <Zap className="h-3 w-3" /> : <Package className="h-3 w-3" />}
                          {product.type}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-right font-semibold">${product.price.toFixed(2)}</td>
                      <td className="px-4 py-4 text-right">
                        <span className={product.type === "PHYSICAL" && product.stock < 10 ? "text-destructive font-semibold" : ""}>
                          {product.type === "VIRTUAL" ? "∞" : product.stock}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Switch
                          checked={product.featured}
                          onCheckedChange={(v) => handleToggleFeatured(product.id, v)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingProduct(product)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Edit Product</DialogTitle>
                              </DialogHeader>
                              <ProductForm categories={categories} product={product} onSuccess={() => {}} />
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(product.id, product.name)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

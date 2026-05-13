"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, type CategoryInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, ImageIcon } from "lucide-react";
import { slugify } from "@/lib/utils";
import toast from "react-hot-toast";

type CategoryWithCount = {
  id: string; name: string; slug: string;
  description: string | null; image: string | null;
  _count: { products: number };
};

export function CategoriesClient({ categories: initialCategories }: { categories: CategoryWithCount[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
  });

  const nameValue = watch("name");

  const openNew = () => {
    reset({ name: "", slug: "", description: "", image: "" });
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (cat: CategoryWithCount) => {
    reset({ name: cat.name, slug: cat.slug, description: cat.description ?? "", image: cat.image ?? "" });
    setEditingId(cat.id);
    setDialogOpen(true);
  };

  const onSubmit = async (data: CategoryInput) => {
    setLoading(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/categories/${editingId}` : "/api/categories";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error || "Failed"); return; }
      toast.success(editingId ? "Category updated!" : "Category created!");
      if (editingId) {
        setCategories((prev) => prev.map((c) => c.id === editingId ? { ...c, ...json.data } : c));
      } else {
        setCategories((prev) => [...prev, { ...json.data, _count: { products: 0 } }]);
      }
      setDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Category deleted");
    } else {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground">{categories.length} categories</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Add Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Category" : "Add Category"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input {...register("name")} placeholder="Electronics" onChange={(e) => {
                  register("name").onChange(e);
                  if (!editingId) setValue("slug", slugify(e.target.value));
                }} />
                {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Slug</Label>
                <Input {...register("slug")} placeholder="electronics" />
                {errors.slug && <p className="text-destructive text-xs">{errors.slug.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea {...register("description")} placeholder="Category description" rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label>Image URL</Label>
                <Input {...register("image")} placeholder="https://…" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? "Update" : "Create"} Category
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <Card key={cat.id} className="overflow-hidden group">
            <div className="relative h-36 bg-muted">
              {cat.image ? (
                <Image src={cat.image} alt={cat.name} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button size="sm" variant="secondary" onClick={() => openEdit(cat)}>
                  <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(cat.id, cat.name)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold">{cat.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{cat._count.products} products · /{cat.slug}</p>
              {cat.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{cat.description}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

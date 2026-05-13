import { useState, useEffect, useCallback } from "react";
import type { ProductWithCategory } from "@/types";

interface UseProductsOptions {
  category?: string;
  type?: string;
  featured?: boolean;
  q?: string;
  page?: number;
  limit?: number;
}

interface UseProductsReturn {
  products: ProductWithCategory[];
  total: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (options.category) params.set("category", options.category);
      if (options.type) params.set("type", options.type);
      if (options.featured) params.set("featured", "true");
      if (options.q) params.set("q", options.q);
      if (options.page) params.set("page", String(options.page));
      if (options.limit) params.set("limit", String(options.limit));

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data.data ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 0);
    } catch (err) {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [
    options.category, options.type, options.featured,
    options.q, options.page, options.limit,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, total, totalPages, loading, error, refetch: fetchProducts };
}

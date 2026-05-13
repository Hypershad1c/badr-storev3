import { prisma } from "@/lib/prisma";
import { ProductsTable } from "./products-table";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return <ProductsTable products={products} categories={categories} />;
}

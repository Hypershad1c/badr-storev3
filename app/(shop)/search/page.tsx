import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/product-card";
import { SearchInput } from "./search-input";
import { SearchX } from "lucide-react";

// Update the type to wrap searchParams in a Promise
export default async function SearchPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string }> 
}) {
  // Await the searchParams before accessing properties
  const params = await searchParams;
  const q = params.q?.trim() ?? "";

  const products = q
    ? await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { shortDescription: { contains: q, mode: "insensitive" } },
            { category: { name: { contains: q, mode: "insensitive" } } },
          ],
        },
        include: { category: true, reviews: true },
        take: 24,
      })
    : [];

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-xl mx-auto mb-10">
        <h1 className="text-2xl font-bold text-center mb-6">Search</h1>
        <SearchInput defaultValue={q}/>
      </div>

      {q && (
        <p className="text-sm text-muted-foreground mb-6">
          {products.length > 0
            ? `${products.length} result${products.length !== 1 ? "s" : ""} for "${q}"`
            : `No results for "${q}"`}
        </p>
      )}

      {products.length === 0 && q && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
          <SearchX className="h-10 w-10 opacity-30"/>
          <p className="text-lg font-medium">No products found</p>
          {/* Fixed unescaped entity in "categories" if any existed, 
              and ensured the string is clean for the compiler */}
          <p className="text-sm">Try different keywords or browse our categories</p>
        </div>
      )}

      {products.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((p) => <ProductCard key={p.id} product={p}/>)}
        </div>
      )}
    </div>
  );
}
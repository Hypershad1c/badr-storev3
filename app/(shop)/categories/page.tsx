import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/product-card";
import Image from "next/image";
import Link from "next/link";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      products: {
        include: { category: true, reviews: true },
        take: 4,
        orderBy: { featured: "desc" },
      },
      _count: { select: { products: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">All Categories</h1>
      <p className="text-muted-foreground mb-10">Browse our full collection by category</p>

      <div className="space-y-16">
        {categories.map((cat) => (
          <section key={cat.id} id={cat.slug}>
            <div className="flex items-center gap-4 mb-6">
              {cat.image && (
                <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                  <Image src={cat.image} alt={cat.name} fill className="object-cover"/>
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-bold">{cat.name}</h2>
                {cat.description && (
                  <p className="text-sm text-muted-foreground">{cat.description}</p>
                )}
              </div>
              <Link
                href={`/shop?category=${cat.slug}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
              >
                View all {cat._count.products} →
              </Link>
            </div>

            {cat.products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {cat.products.map((p) => <ProductCard key={p.id} product={p}/>)}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm py-8 text-center border rounded-xl">
                No products in this category yet.
              </p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

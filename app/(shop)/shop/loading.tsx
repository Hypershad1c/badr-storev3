import { ProductCardSkeleton } from "@/components/ui/skeleton";

export default function ShopLoading() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="h-8 w-32 bg-muted rounded-lg animate-pulse mb-2" />
      <div className="h-4 w-48 bg-muted/60 rounded animate-pulse mb-8" />
      <div className="h-14 w-full bg-muted/40 rounded-xl animate-pulse mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

import { Metadata } from "next";
import { HeroSection } from "@/components/shop/hero-section";
import { FeaturedProducts } from "@/components/shop/featured-products";
import { CategoriesSection } from "@/components/shop/categories-section";
import { TestimonialsSection } from "@/components/shop/testimonials-section";
import { CTASection } from "@/components/shop/cta-section";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Apex Store — Premium Products & Services",
};

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    prisma.product.findMany({
      where: { featured: true },
      include: { category: true, reviews: true },
      take: 8,
    }),
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
    }),
  ]);

  return (
    <main>
      <HeroSection />
      <FeaturedProducts products={featuredProducts} />
      <CategoriesSection categories={categories} />
      <TestimonialsSection />
      <CTASection />
    </main>
  );
}

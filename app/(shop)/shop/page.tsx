import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ShopClientPage } from "./shop-client";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse our collection of premium products and digital services.",
};

// Update: searchParams is now a Promise in Next.js 15
interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    type?: string;
    sort?: string;
    q?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

const PRODUCTS_PER_PAGE = 12;

export default async function ShopPage({ searchParams }: ShopPageProps) {
  // 1. Await the searchParams promise
  const params = await searchParams;

  const page = Number(params.page) || 1;
  const skip = (page - 1) * PRODUCTS_PER_PAGE;

  const where: Record<string, unknown> = {};

  // 2. Use the awaited 'params' instead of 'searchParams'
  if (params.category) {
    where.category = { slug: params.category };
  }
  if (params.type) {
    where.type = params.type;
  }
  if (params.q) {
    where.OR = [
      { name: { contains: params.q, mode: "insensitive" } },
      { description: { contains: params.q, mode: "insensitive" } },
    ];
  }
  if (params.minPrice || params.maxPrice) {
    where.price = {
      gte: params.minPrice ? Number(params.minPrice) : undefined,
      lte: params.maxPrice ? Number(params.maxPrice) : undefined,
    };
  }

  const orderBy: Record<string, string> = {};
  switch (params.sort) {
    case "price-asc":
      orderBy.price = "asc";
      break;
    case "price-desc":
      orderBy.price = "desc";
      break;
    case "newest":
      orderBy.createdAt = "desc";
      break;
    default:
      orderBy.featured = "desc";
  }

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true, reviews: true },
      orderBy,
      skip,
      take: PRODUCTS_PER_PAGE,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany(),
  ]);

  return (
    <ShopClientPage
      products={products}
      categories={categories}
      total={total}
      page={page}
      totalPages={Math.ceil(total / PRODUCTS_PER_PAGE)}
      searchParams={params} // Pass the unwrapped params to the client
    />
  );
}
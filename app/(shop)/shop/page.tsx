import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ShopClientPage } from "./shop-client";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse our collection of premium products and digital services.",
};

interface ShopPageProps {
  searchParams: {
    category?: string;
    type?: string;
    sort?: string;
    q?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

const PRODUCTS_PER_PAGE = 12;

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const page = Number(searchParams.page) || 1;
  const skip = (page - 1) * PRODUCTS_PER_PAGE;

  const where: Record<string, unknown> = {};

  if (searchParams.category) {
    where.category = { slug: searchParams.category };
  }
  if (searchParams.type) {
    where.type = searchParams.type;
  }
  if (searchParams.q) {
    where.OR = [
      { name: { contains: searchParams.q, mode: "insensitive" } },
      { description: { contains: searchParams.q, mode: "insensitive" } },
    ];
  }
  if (searchParams.minPrice || searchParams.maxPrice) {
    where.price = {
      gte: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
      lte: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    };
  }

  const orderBy: Record<string, string> = {};
  switch (searchParams.sort) {
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
      searchParams={searchParams}
    />
  );
}

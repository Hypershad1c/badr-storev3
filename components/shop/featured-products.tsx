"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "./product-card";
import { Button } from "@/components/ui/button";
import type { ProductWithCategory } from "@/types";

interface FeaturedProductsProps {
  products: ProductWithCategory[];
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <section className="py-20 container mx-auto px-4">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Handpicked for you</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Featured Products</h2>
        </div>
        <Button asChild variant="ghost" className="hidden md:flex">
          <Link href="/shop">
            View all <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
      >
        {products.map((product) => (
          <motion.div key={product.id} variants={item}>
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>

      <div className="text-center mt-10 md:hidden">
        <Button asChild variant="outline">
          <Link href="/shop">
            View all products <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

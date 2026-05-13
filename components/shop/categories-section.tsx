"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Category } from "@prisma/client";

type CategoryWithCount = Category & { _count: { products: number } };

interface CategoriesSectionProps {
  categories: CategoryWithCount[];
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-muted-foreground mb-2">Find what you need</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Shop by Category</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category, i) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              viewport={{ once: true }}
            >
              <Link
                href={`/categories#${category.slug}`}
                className="group relative block overflow-hidden rounded-xl aspect-square bg-muted"
              >
                {category.image && (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-bold text-white text-lg leading-tight">{category.name}</h3>
                  <p className="text-white/70 text-xs mt-0.5 flex items-center gap-1">
                    {category._count.products} products
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

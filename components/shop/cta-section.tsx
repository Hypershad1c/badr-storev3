"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-20 bg-foreground dark:bg-card">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/10 text-background dark:text-foreground text-sm font-medium mb-6">
            <Zap className="h-3.5 w-3.5" />
            Digital services available instantly
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-background dark:text-foreground mb-4">
            Ready to get started?
          </h2>
          <p className="text-background/70 dark:text-muted-foreground mb-8 text-lg">
            Join thousands of customers who trust Apex for their premium products and
            digital service needs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" variant="secondary" className="h-12 px-8">
              <Link href="/shop">
                Shop Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-8 border-background/20 text-background hover:bg-background/10 dark:border-border dark:text-foreground">
              <Link href="/contact">Get in Touch</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

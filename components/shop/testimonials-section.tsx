"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Designer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    rating: 5,
    text: "The quality of the headphones blew me away. Crystal clear audio, incredible ANC, and the build quality feels premium. Best purchase I've made this year.",
  },
  {
    name: "Marcus Williams",
    role: "Software Engineer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marcus",
    rating: 5,
    text: "The web development service was exceptional. They delivered ahead of schedule and the code quality is impeccable. Will definitely work with them again.",
  },
  {
    name: "Emma Rodriguez",
    role: "Content Creator",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma",
    rating: 5,
    text: "Ordered the sneakers and they arrived perfectly packaged. The fit is true to size and the materials are clearly high quality. Impressed by the whole experience.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 container mx-auto px-4">
      <div className="text-center mb-12">
        <p className="text-sm font-medium text-muted-foreground mb-2">What people say</p>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Customer Reviews</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            viewport={{ once: true }}
            className="relative p-6 rounded-xl border bg-card"
          >
            <Quote className="absolute top-4 right-4 h-8 w-8 text-muted/30" />
            <div className="flex items-center gap-1 mb-4">
              {Array.from({ length: t.rating }).map((_, j) => (
                <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground mb-6">{t.text}</p>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-muted overflow-hidden">
                {/* Avatar placeholder */}
                <div className="h-full w-full flex items-center justify-center text-muted-foreground font-bold text-sm">
                  {t.name[0]}
                </div>
              </div>
              <div>
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

import Link from "next/link";
import { Github, Twitter, Instagram } from "lucide-react";

const footerLinks = {
  shop: [
    { href: "/shop", label: "All Products" },
    { href: "/categories", label: "Categories" },
    { href: "/search", label: "Search" },
    { href: "/wishlist", label: "Wishlist" },
  ],
  support: [
    { href: "/contact", label: "Contact Us" },
    { href: "/orders", label: "Track Order" },
    { href: "/faq", label: "FAQ" },
    { href: "/returns", label: "Returns" },
  ],
  company: [
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/careers", label: "Careers" },
    { href: "/press", label: "Press" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <div className="h-7 w-7 rounded-lg bg-foreground flex items-center justify-center">
                <span className="text-background text-sm font-black">A</span>
              </div>
              <span>Apex</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium products and digital services, crafted for the modern world.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a
                href="#"
                className="h-8 w-8 rounded-full border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="h-3.5 w-3.5" />
              </a>
              <a
                href="#"
                className="h-8 w-8 rounded-full border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <Instagram className="h-3.5 w-3.5" />
              </a>
              <a
                href="#"
                className="h-8 w-8 rounded-full border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Shop</h3>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Apex Store. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

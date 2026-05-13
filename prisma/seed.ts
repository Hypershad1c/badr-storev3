import { PrismaClient, Role, ProductType, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── USERS ────────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@store.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@store.com",
      password: hashedPassword,
      role: Role.ADMIN,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@store.com" },
    update: {},
    create: {
      name: "Business Manager",
      email: "manager@store.com",
      password: hashedPassword,
      role: Role.BUSINESS_MANAGER,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=manager",
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@store.com" },
    update: {},
    create: {
      name: "Jane Customer",
      email: "customer@store.com",
      password: hashedPassword,
      role: Role.CUSTOMER,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=customer",
    },
  });

  console.log("✅ Users created");

  // ── CATEGORIES ───────────────────────────────────────────────────────────
  const electronics = await prisma.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: {
      name: "Electronics",
      slug: "electronics",
      description: "Cutting-edge tech for every lifestyle",
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400",
    },
  });

  const clothing = await prisma.category.upsert({
    where: { slug: "clothing" },
    update: {},
    create: {
      name: "Clothing",
      slug: "clothing",
      description: "Premium fashion for every occasion",
      image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400",
    },
  });

  const services = await prisma.category.upsert({
    where: { slug: "services" },
    update: {},
    create: {
      name: "Digital Services",
      slug: "services",
      description: "Professional digital services on demand",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400",
    },
  });

  const accessories = await prisma.category.upsert({
    where: { slug: "accessories" },
    update: {},
    create: {
      name: "Accessories",
      slug: "accessories",
      description: "Complete your look with our premium accessories",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
    },
  });

  console.log("✅ Categories created");

  // ── PRODUCTS ─────────────────────────────────────────────────────────────
  const products = [
    {
      name: "Apex Pro Wireless Headphones",
      slug: "apex-pro-wireless-headphones",
      description:
        "Experience audio like never before with our flagship Apex Pro headphones. Featuring 40mm drivers, active noise cancellation, and 30-hour battery life. Built for audiophiles and everyday listeners alike.",
      shortDescription: "Premium ANC headphones with 30hr battery",
      price: 349.99,
      comparePrice: 449.99,
      stock: 48,
      sku: "APX-HP-001",
      featured: true,
      type: ProductType.PHYSICAL,
      categoryId: electronics.id,
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600",
      ],
      variants: {
        colors: [
          { name: "Midnight Black", value: "#1a1a1a" },
          { name: "Arctic White", value: "#f5f5f5" },
          { name: "Navy Blue", value: "#1e3a5f" },
        ],
      },
    },
    {
      name: "Nexus 4K Smart Watch",
      slug: "nexus-4k-smart-watch",
      description:
        "The Nexus smartwatch redefines wearable technology. With health monitoring, GPS, a stunning AMOLED display, and 7-day battery life, it's your perfect companion for every adventure.",
      shortDescription: "Advanced smartwatch with health monitoring & GPS",
      price: 299.99,
      comparePrice: 399.99,
      stock: 72,
      sku: "NXS-SW-001",
      featured: true,
      type: ProductType.PHYSICAL,
      categoryId: electronics.id,
      images: [
        "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600",
        "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600",
      ],
      variants: {
        sizes: ["40mm", "44mm"],
        colors: [
          { name: "Space Gray", value: "#4a4a4a" },
          { name: "Silver", value: "#c0c0c0" },
          { name: "Gold", value: "#d4af37" },
        ],
      },
    },
    {
      name: "Urban Elite Sneakers",
      slug: "urban-elite-sneakers",
      description:
        "Crafted for performance and style, the Urban Elite sneakers feature responsive foam cushioning, breathable mesh upper, and a durable rubber outsole. Available in multiple colorways.",
      shortDescription: "Performance sneakers for everyday wear",
      price: 189.99,
      comparePrice: 229.99,
      stock: 120,
      sku: "UE-SNK-001",
      featured: true,
      type: ProductType.PHYSICAL,
      categoryId: clothing.id,
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
        "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600",
      ],
      variants: {
        sizes: ["6", "7", "8", "9", "10", "11", "12"],
        colors: [
          { name: "White/Black", value: "#ffffff" },
          { name: "All Black", value: "#000000" },
          { name: "Red/White", value: "#ff0000" },
        ],
      },
    },
    {
      name: "Minimal Leather Wallet",
      slug: "minimal-leather-wallet",
      description:
        "Italian full-grain leather crafted into the perfect minimalist wallet. Holds up to 8 cards with RFID protection. Slim enough for front-pocket carry.",
      shortDescription: "RFID-blocking slim leather wallet",
      price: 79.99,
      comparePrice: null,
      stock: 200,
      sku: "MLW-ACC-001",
      featured: false,
      type: ProductType.PHYSICAL,
      categoryId: accessories.id,
      images: [
        "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600",
      ],
      variants: {
        colors: [
          { name: "Tan", value: "#d2691e" },
          { name: "Black", value: "#1a1a1a" },
          { name: "Cognac", value: "#9b4722" },
        ],
      },
    },
    {
      name: "Professional Web Development",
      slug: "professional-web-development",
      description:
        "Get a stunning, high-performance website built by our expert team. We handle everything from design to deployment — Next.js, React, and modern web technologies. Includes 1 month of post-launch support.",
      shortDescription: "Full-stack website development service",
      price: 1499.99,
      comparePrice: 2499.99,
      stock: 999,
      sku: "SVC-WEB-001",
      featured: true,
      type: ProductType.VIRTUAL,
      categoryId: services.id,
      images: [
        "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600",
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600",
      ],
      // Use Prisma.JsonNull instead of standard null for JSON fields
      variants: Prisma.JsonNull,
    },
    {
      name: "Premium Graphic Design Package",
      slug: "premium-graphic-design-package",
      description:
        "Complete brand identity package including logo design, color palette, typography guide, business card, and social media assets. 3 revision rounds included with full ownership of all files.",
      shortDescription: "Complete brand identity & design package",
      price: 599.99,
      comparePrice: 899.99,
      stock: 999,
      sku: "SVC-DES-001",
      featured: true,
      type: ProductType.VIRTUAL,
      categoryId: services.id,
      images: [
        "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600",
      ],
      // Use Prisma.JsonNull instead of standard null for JSON fields
      variants: Prisma.JsonNull,
    },
    {
      name: "Merino Wool Crewneck Sweater",
      slug: "merino-wool-crewneck-sweater",
      description:
        "Made from 100% premium Merino wool, this crewneck is extraordinarily soft against the skin while providing natural temperature regulation. A wardrobe essential.",
      shortDescription: "100% Merino wool luxury crewneck",
      price: 149.99,
      comparePrice: 199.99,
      stock: 85,
      sku: "CLO-SWT-001",
      featured: false,
      type: ProductType.PHYSICAL,
      categoryId: clothing.id,
      images: [
        "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600",
      ],
      variants: {
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        colors: [
          { name: "Cream", value: "#fffdd0" },
          { name: "Charcoal", value: "#36454f" },
          { name: "Forest Green", value: "#228b22" },
        ],
      },
    },
    {
      name: "Portable Bluetooth Speaker",
      slug: "portable-bluetooth-speaker",
      description:
        "360° sound in a rugged, waterproof design. The Apex Go speaker delivers rich bass and crystal-clear highs for up to 24 hours on a single charge. IP67 rated for any adventure.",
      shortDescription: "Waterproof speaker with 24hr battery",
      price: 129.99,
      comparePrice: 159.99,
      stock: 60,
      sku: "APX-SPK-001",
      featured: false,
      type: ProductType.PHYSICAL,
      categoryId: electronics.id,
      images: [
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600",
      ],
      variants: {
        colors: [
          { name: "Slate Black", value: "#2f4f4f" },
          { name: "Sunrise Orange", value: "#ff6347" },
          { name: "Ocean Blue", value: "#006994" },
        ],
      },
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      // Casting to 'any' or ProductCreateInput ensures the complex variants 
      // object doesn't trigger unchecked input errors
      create: product as any,
    });
  }

  console.log("✅ Products created");

  // ── SAMPLE ADDRESS ────────────────────────────────────────────────────────
  await prisma.address.upsert({
    where: { id: "demo-address-001" },
    update: {},
    create: {
      id: "demo-address-001",
      userId: customer.id,
      firstName: "Jane",
      lastName: "Customer",
      country: "United States",
      state: "California",
      city: "San Francisco",
      postalCode: "94102",
      line1: "123 Market Street",
      line2: "Apt 4B",
      phone: "+1 415 555 0192",
      isDefault: true,
    },
  });

  // ── SAMPLE REVIEWS ────────────────────────────────────────────────────────
  const headphones = await prisma.product.findUnique({
    where: { slug: "apex-pro-wireless-headphones" },
  });

  if (headphones) {
    await prisma.review.upsert({
      where: { userId_productId: { userId: customer.id, productId: headphones.id } },
      update: {},
      create: {
        userId: customer.id,
        productId: headphones.id,
        rating: 5,
        comment:
          "These headphones are absolutely incredible. The noise cancellation is top-notch and the sound quality is phenomenal. Worth every penny!",
      },
    });
  }

  // ── COUPONS ───────────────────────────────────────────────────────────────
  await prisma.coupon.upsert({
    where: { code: "WELCOME20" },
    update: {},
    create: {
      code: "WELCOME20",
      discount: 20,
      discountType: "PERCENTAGE",
      minOrderAmount: 50,
      maxUses: 1000,
      active: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "SAVE50" },
    update: {},
    create: {
      code: "SAVE50",
      discount: 50,
      discountType: "FIXED",
      minOrderAmount: 200,
      maxUses: 100,
      active: true,
    },
  });

  console.log("✅ Coupons created");

  console.log("\n🎉 Seeding complete!");
  console.log("\n👤 Demo Accounts:");
  console.log("   Admin:    admin@store.com    / password123");
  console.log("   Manager:  manager@store.com  / password123");
  console.log("   Customer: customer@store.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
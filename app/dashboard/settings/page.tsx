import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const session = await auth();
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return <SettingsClient userId={session!.user.id} coupons={coupons} />;
}

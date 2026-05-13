import { prisma } from "@/lib/prisma";
import { VirtualRequestsClient } from "./virtual-requests-client";

export default async function VirtualRequestsPage() {
  const requests = await prisma.virtualRequest.findMany({
    include: {
      user: { select: { name: true, email: true, avatar: true } },
      product: { select: { name: true, images: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return <VirtualRequestsClient requests={requests} />;
}

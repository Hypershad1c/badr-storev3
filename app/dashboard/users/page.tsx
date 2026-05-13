import { prisma } from "@/lib/prisma";
import { UsersTable } from "./users-table";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, role: true,
      avatar: true, banned: true, createdAt: true,
      _count: { select: { orders: true } },
    },
  });
  return <UsersTable users={users} />;
}

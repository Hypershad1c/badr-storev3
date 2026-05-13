"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");
  return session;
}

export async function banUser(userId: string) {
  const session = await requireAdmin();
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return { error: "User not found" };
  if (target.role === "ADMIN") return { error: "Cannot ban admin" };

  await prisma.user.update({ where: { id: userId }, data: { banned: true } });
  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function unbanUser(userId: string) {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { banned: false } });
  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function changeUserRole(userId: string, role: Role) {
  const session = await requireAdmin();
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return { error: "User not found" };
  if (target.id === session.user.id) return { error: "Cannot change your own role" };
  if (target.role === "ADMIN" && role !== "ADMIN") return { error: "Cannot demote admin" };

  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function deleteUser(userId: string) {
  const session = await requireAdmin();
  if (userId === session.user.id) return { error: "Cannot delete yourself" };
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return { error: "User not found" };
  if (target.role === "ADMIN") return { error: "Cannot delete admin" };

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/dashboard/users");
  return { success: true };
}

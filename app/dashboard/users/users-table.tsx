"use client";

import { useState } from "react";
import { banUser, unbanUser, changeUserRole, deleteUser } from "@/actions/users";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, getInitials } from "@/lib/utils";
import { Search, ShieldBan, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import type { Role } from "@prisma/client";

type UserRow = {
  id: string; name: string; email: string; role: Role;
  avatar: string | null; banned: boolean; createdAt: Date;
  _count: { orders: number };
};

export function UsersTable({ users }: { users: UserRow[] }) {
  const [search, setSearch] = useState("");

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleBan = async (id: string, banned: boolean) => {
    const result = banned ? await unbanUser(id) : await banUser(id);
    if (result.success) toast.success(banned ? "User unbanned" : "User banned");
    else toast.error(result.error ?? "Failed");
  };

  const handleRoleChange = async (id: string, role: Role) => {
    const result = await changeUserRole(id, role);
    if (result.success) toast.success("Role updated");
    else toast.error(result.error ?? "Failed");
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"?`)) return;
    const result = await deleteUser(id);
    if (result.success) toast.success("User deleted");
    else toast.error(result.error ?? "Failed");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground">{users.length} registered users</p>
      </div>
      <Card>
        <CardHeader className="pb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users…" className="pl-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr>
                  {["User","Role","Orders","Status","Joined","Actions"].map((h) => (
                    <th key={h} className="text-left font-medium px-4 py-3 text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar ?? undefined} />
                          <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {user.role !== "ADMIN" ? (
                        <Select defaultValue={user.role} onValueChange={(v) => handleRoleChange(user.id, v as Role)}>
                          <SelectTrigger className="h-7 w-40 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CUSTOMER">Customer</SelectItem>
                            <SelectItem value="BUSINESS_MANAGER">Business Manager</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge>ADMIN</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{user._count.orders}</td>
                    <td className="px-4 py-3">
                      <Badge variant={user.banned ? "destructive" : "secondary"}>
                        {user.banned ? "Banned" : "Active"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {user.role !== "ADMIN" && (
                          <>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleBan(user.id, user.banned)} title={user.banned ? "Unban" : "Ban"}>
                              <ShieldBan className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(user.id, user.name)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

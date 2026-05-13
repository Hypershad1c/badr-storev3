"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { profileSchema, changePasswordSchema, type ProfileInput } from "@/lib/validations";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Shield, Package } from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

interface ProfileClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    role: string;
    createdAt: Date;
  };
}

export function ProfileClient({ user }: ProfileClientProps) {
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const router = useRouter();

  const profileForm = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name },
  });

  const onProfileSubmit = async (data: ProfileInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success("Profile updated!");
        router.refresh();
      } else {
        toast.error("Failed to update profile");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.avatar ?? undefined}/>
          <AvatarFallback className="text-lg">{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground text-sm">{user.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">{user.role}</Badge>
            <span className="text-xs text-muted-foreground">Joined {formatDate(user.createdAt)}</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile"><User className="mr-2 h-3.5 w-3.5"/>Profile</TabsTrigger>
          <TabsTrigger value="security"><Shield className="mr-2 h-3.5 w-3.5"/>Security</TabsTrigger>
          <TabsTrigger value="orders" asChild>
            <Link href="/orders"><Package className="mr-2 h-3.5 w-3.5"/>Orders</Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input {...profileForm.register("name")}/>
                  {profileForm.formState.errors.name && (
                    <p className="text-destructive text-xs">{profileForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input value={user.email} readOnly className="bg-muted/40 cursor-not-allowed"/>
                  <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                </div>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader><CardTitle className="text-base">Change Password</CardTitle></CardHeader>
            <CardContent>
              <ChangePasswordForm/>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ChangePasswordForm() {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await fetch("/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success("Password changed!");
        reset();
      } else {
        const json = await res.json();
        toast.error(json.error || "Failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Current Password</Label>
        <Input type="password" {...register("currentPassword")}/>
        {errors.currentPassword && <p className="text-destructive text-xs">{String(errors.currentPassword.message)}</p>}
      </div>
      <div className="space-y-1.5">
        <Label>New Password</Label>
        <Input type="password" {...register("newPassword")}/>
        {errors.newPassword && <p className="text-destructive text-xs">{String(errors.newPassword.message)}</p>}
      </div>
      <div className="space-y-1.5">
        <Label>Confirm New Password</Label>
        <Input type="password" {...register("confirmPassword")}/>
        {errors.confirmPassword && <p className="text-destructive text-xs">{String(errors.confirmPassword.message)}</p>}
      </div>
      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
        Update Password
      </Button>
    </form>
  );
}

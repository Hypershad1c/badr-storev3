"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // In production, integrate with a password-reset email flow
    await new Promise((r) => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
    toast.success("Reset link sent if email exists");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-10 justify-center">
          <div className="h-9 w-9 rounded-xl bg-foreground flex items-center justify-center">
            <span className="text-background font-black">A</span>
          </div>
          <span>Apex Store</span>
        </Link>

        <div className="border rounded-2xl p-8 bg-card shadow-sm">
          {sent ? (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-emerald-500"/>
              </div>
              <h2 className="text-xl font-bold mb-2">Check your inbox</h2>
              <p className="text-sm text-muted-foreground mb-6">
                If an account with that email exists, we sent a password reset link.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/login"><ArrowLeft className="mr-2 h-4 w-4"/> Back to Sign In</Link>
              </Button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-1">Forgot Password</h1>
              <p className="text-muted-foreground text-sm mb-8">
                Enter your email and we'll send you a reset link.
              </p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                  Send Reset Link
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Remember your password?{" "}
          <Link href="/login" className="text-foreground font-medium hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}

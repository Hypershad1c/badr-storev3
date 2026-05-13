"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { virtualRequestSchema, type VirtualRequestInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2, Zap } from "lucide-react"; // Removed 'Upload'
import { createVirtualRequest } from "@/actions/virtual-requests";
import toast from "react-hot-toast";
import Link from "next/link";

interface ServiceRequestFormProps {
  productId: string;
  productName: string;
}

export function ServiceRequestForm({ productId, productName }: ServiceRequestFormProps) {
  const { data: session } = useSession();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  // Removed unused 'files' and 'setFiles' state

  const { register, handleSubmit, formState: { errors } } = useForm<VirtualRequestInput>({
    resolver: zodResolver(virtualRequestSchema),
    defaultValues: { productId },
  });

  if (!session) {
    return (
      <div className="p-6 rounded-xl border bg-card text-center">
        <Zap className="h-8 w-8 mx-auto mb-3 text-muted-foreground/40" />
        <p className="font-semibold mb-1">Sign in to Request This Service</p>
        <p className="text-sm text-muted-foreground mb-4">
          Create an account to submit your project details.
        </p>
        <Button asChild>
          <Link href={`/login?callbackUrl=/product/${productId}`}>Sign In</Link>
        </Button>
      </div>
    );
  }

  const onSubmit = async (data: VirtualRequestInput) => {
    setLoading(true);
    // Removed unused files array from payload
    const result = await createVirtualRequest({ ...data });
    if (result.error) {
      toast.error(result.error);
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  };

  return (
    <AnimatePresence mode="wait">
      {submitted ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-xl border bg-card text-center"
        >
          <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="font-bold text-lg mb-1">Request Submitted!</h3>
          <p className="text-sm text-muted-foreground">
            We&apos;ve received your request for{" "}
            <span className="font-medium text-foreground">{productName}</span>. Our team
            will review it and get back to you within 24 hours.
          </p>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 rounded-xl border bg-card space-y-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Request This Service</h3>
          </div>

          <input type="hidden" {...register("productId")} value={productId} />

          <div className="space-y-1.5">
            <Label>Describe your project</Label>
            <Textarea
              {...register("message")}
              rows={5}
              placeholder="Tell us about your project, requirements, timeline, and any other details that would help us understand your needs…"
            />
            {errors.message && (
              <p className="text-destructive text-xs">{errors.message.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…</>
            ) : (
              <><Zap className="mr-2 h-4 w-4" /> Submit Request</>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Free to request · No upfront payment required
          </p>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
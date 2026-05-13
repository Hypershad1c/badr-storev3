"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { contactSchema, type ContactInput } from "@/lib/validations";
import { sendContactEmail } from "@/lib/email";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Loader2, Mail, MapPin, Phone } from "lucide-react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSent(true);
        reset();
        toast.success("Message sent!");
      } else {
        toast.error("Failed to send message");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3">Get in Touch</h1>
        <p className="text-muted-foreground text-lg">We're here to help. Reach out and we'll respond within 24 hours.</p>
      </div>

      <div className="grid md:grid-cols-5 gap-10">
        {/* Contact Info */}
        <div className="md:col-span-2 space-y-6">
          {[
            { icon: Mail, label: "Email", value: "support@apexstore.com" },
            { icon: Phone, label: "Phone", value: "+1 (555) 000-0000" },
            { icon: MapPin, label: "Address", value: "123 Commerce St, SF, CA 94102" },
          ].map((item) => (
            <div key={item.label} className="flex gap-4">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <item.icon className="h-4 w-4 text-muted-foreground"/>
              </div>
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.value}</p>
              </div>
            </div>
          ))}

          <div className="p-5 rounded-xl bg-muted/40 border">
            <p className="text-sm font-semibold mb-1">Business Hours</p>
            <p className="text-xs text-muted-foreground">Monday–Friday: 9am – 6pm EST</p>
            <p className="text-xs text-muted-foreground">Saturday: 10am – 4pm EST</p>
            <p className="text-xs text-muted-foreground">Sunday: Closed</p>
          </div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-3 p-6 rounded-2xl border bg-card shadow-sm"
        >
          {sent ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
              <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle className="h-7 w-7 text-emerald-500"/>
              </div>
              <h3 className="font-semibold text-lg">Message Sent!</h3>
              <p className="text-sm text-muted-foreground">We'll get back to you within 24 hours.</p>
              <Button variant="outline" onClick={() => setSent(false)}>Send Another</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input {...register("name")} placeholder="Jane Smith"/>
                  {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" {...register("email")} placeholder="jane@example.com"/>
                  {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Subject</Label>
                <Input {...register("subject")} placeholder="How can we help?"/>
                {errors.subject && <p className="text-destructive text-xs">{errors.subject.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Message</Label>
                <Textarea {...register("message")} rows={5} placeholder="Tell us more…"/>
                {errors.message && <p className="text-destructive text-xs">{errors.message.message}</p>}
              </div>
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Send Message
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}

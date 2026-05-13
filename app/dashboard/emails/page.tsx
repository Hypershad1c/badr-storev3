"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Send, Loader2, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const emailTemplates = [
  { id: "welcome", label: "Welcome Email", subject: "Welcome to Apex Store 🎉" },
  { id: "announcement", label: "Store Announcement", subject: "Important Update from Apex Store" },
  { id: "promotion", label: "Promotion / Sale", subject: "Exclusive Offer Just for You 🎁" },
  { id: "custom", label: "Custom Email", subject: "" },
];

export default function EmailsPage() {
  const [template, setTemplate] = useState("custom");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleTemplateChange = (id: string) => {
    setTemplate(id);
    const t = emailTemplates.find((t) => t.id === id);
    if (t && id !== "custom") setSubject(t.subject);
  };

  const handleSend = async () => {
    if (!to || !subject || !body) { toast.error("Fill in all fields"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, body }),
      });
      if (res.ok) {
        setSent(true);
        toast.success("Email sent!");
        setTimeout(() => setSent(false), 3000);
        setTo(""); setSubject(""); setBody("");
      } else {
        toast.error("Failed to send email");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Email Center</h1>
        <p className="text-sm text-muted-foreground">Send transactional or marketing emails via Resend</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4"/> Compose Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Template</Label>
            <Select value={template} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue/>
              </SelectTrigger>
              <SelectContent>
                {emailTemplates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Recipient Email</Label>
            <Input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="customer@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject line"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Message</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              placeholder="Write your email message here…"
            />
          </div>

          <Button onClick={handleSend} disabled={loading || sent} className="w-full">
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Sending…</>
            ) : sent ? (
              <><CheckCircle className="mr-2 h-4 w-4"/> Sent!</>
            ) : (
              <><Send className="mr-2 h-4 w-4"/> Send Email</>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Automatic Email Triggers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { event: "New registration", desc: "Welcome email sent automatically on sign up", active: true },
              { event: "Order confirmed", desc: "Order confirmation with item list sent on payment", active: true },
              { event: "Service request", desc: "Confirmation to customer + alert to admin", active: true },
              { event: "Contact form", desc: "Message forwarded to admin email", active: true },
            ].map((t) => (
              <div key={t.event} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{t.event}</p>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                </div>
                <span className="text-xs text-emerald-500 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Active
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

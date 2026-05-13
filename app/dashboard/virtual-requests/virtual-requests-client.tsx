"use client";

import { useState } from "react";
import { updateVirtualRequestStatus } from "@/actions/virtual-requests";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDateTime, getInitials } from "@/lib/utils";
import { MessageSquare, Zap } from "lucide-react";
import toast from "react-hot-toast";
import type { VirtualRequest, VirtualRequestStatus } from "@prisma/client";

type RequestWithRelations = VirtualRequest & {
  user: { name: string; email: string; avatar: string | null };
  product: { name: string; images: string[] };
};

const statusColors: Record<string, string> = {
  PENDING: "secondary",
  IN_PROGRESS: "outline",
  COMPLETED: "default",
  CANCELLED: "destructive",
};

export function VirtualRequestsClient({ requests }: { requests: RequestWithRelations[] }) {
  const [selected, setSelected] = useState<RequestWithRelations | null>(null);
  const [note, setNote] = useState("");
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async (id: string, status: VirtualRequestStatus) => {
    setUpdating(true);
    const result = await updateVirtualRequestStatus(id, status, note || undefined);
    if (result.success) toast.success("Request updated");
    else toast.error(result.error ?? "Failed");
    setUpdating(false);
    setSelected(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Service Requests</h1>
        <p className="text-sm text-muted-foreground">{requests.length} total requests</p>
      </div>

      <div className="grid gap-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
              <Zap className="h-8 w-8 opacity-30" />
              <p>No service requests yet</p>
            </CardContent>
          </Card>
        ) : (
          requests.map((req) => (
            <Card key={req.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-start gap-4 p-5">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={req.user.avatar ?? undefined} />
                    <AvatarFallback>{getInitials(req.user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="font-semibold">{req.user.name}</p>
                        <p className="text-xs text-muted-foreground">{req.user.email}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant={(statusColors[req.status] as any) || "secondary"}>{req.status.replace("_", " ")}</Badge>
                        <span className="text-xs text-muted-foreground">{formatDateTime(req.createdAt)}</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Service: <span className="text-foreground">{req.product.name}</span>
                    </p>
                    <p className="text-sm leading-relaxed line-clamp-3 mb-3">{req.message}</p>
                    {req.adminNote && (
                      <div className="bg-muted/50 rounded-lg p-3 text-sm">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Admin Note:</p>
                        <p>{req.adminNote}</p>
                      </div>
                    )}
                    {req.files.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">{req.files.length} attached file{req.files.length !== 1 ? "s" : ""}</p>
                    )}
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => { setSelected(req); setNote(req.adminNote ?? ""); }}>
                        <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Manage
                      </Button>
                    </DialogTrigger>
                    {selected?.id === req.id && (
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Manage Request</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium mb-1">Customer</p>
                            <p className="text-sm text-muted-foreground">{req.user.name} — {req.user.email}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">Message</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">{req.message}</p>
                          </div>
                          <div className="space-y-1.5">
                            <p className="text-sm font-medium">Admin Note (sent to customer)</p>
                            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note for the customer…" rows={3} />
                          </div>
                          <div className="space-y-1.5">
                            <p className="text-sm font-medium">Update Status</p>
                            <div className="flex gap-2 flex-wrap">
                              {["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((s) => (
                                <Button
                                  key={s}
                                  variant={req.status === s ? "default" : "outline"}
                                  size="sm"
                                  disabled={updating}
                                  onClick={() => handleUpdate(req.id, s as VirtualRequestStatus)}
                                >
                                  {s.replace("_", " ")}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    )}
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

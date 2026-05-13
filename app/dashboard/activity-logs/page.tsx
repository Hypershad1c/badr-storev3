import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const actionColors: Record<string, string> = {
  ORDER_PLACED: "default",
  PRODUCT_CREATED: "outline",
  PRODUCT_UPDATED: "outline",
  PRODUCT_DELETED: "destructive",
  USER_BANNED: "destructive",
  USER_UNBANNED: "secondary",
  ROLE_CHANGED: "secondary",
};

export default async function ActivityLogsPage() {
  const logs = await prisma.activityLog.findMany({
    include: { user: { select: { name: true, email: true, avatar: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Activity Logs</h1>
        <p className="text-sm text-muted-foreground">Last 100 system events</p>
      </div>

      <Card>
        <CardContent className="p-0 divide-y">
          {logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">No activity yet</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/20 transition-colors">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={log.user.avatar ?? undefined}/>
                  <AvatarFallback className="text-xs">{log.user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{log.user.name}</span>
                    {" · "}
                    <span className="text-muted-foreground">{log.action.replace(/_/g," ")}</span>
                    {log.entityId && (
                      <span className="text-muted-foreground"> · #{log.entityId.slice(-8).toUpperCase()}</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{log.user.email}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Badge variant={(actionColors[log.action] as any) ?? "secondary"} className="text-xs">
                    {log.entity}
                  </Badge>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDateTime(log.createdAt)}
                  </span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

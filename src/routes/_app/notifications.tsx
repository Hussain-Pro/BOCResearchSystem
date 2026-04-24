import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Bell, Check, CheckCircle2, AlertCircle, Info, Clock, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (!user) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read") return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = async () => {
    try {
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success("تم تحديد كل الإشعارات كمقروءة");
    } catch (error) {
      toast.error("فشل التحديث");
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const getIcon = (type: string) => {
    if (type?.includes("Success")) return <CheckCircle2 className="h-5 w-5 text-success" />;
    if (type?.includes("Warning") || type?.includes("Error")) return <AlertCircle className="h-5 w-5 text-warning" />;
    return <Info className="h-5 w-5 text-info" />;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="الإشعارات"
        description="تابع آخر التحديثات والتنبيهات الخاصة بحسابك"
        actions={
          unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead} className="gap-2">
              <Check className="h-4 w-4" />
              تحديد الكل كمقروء
            </Button>
          )
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            سجل الإشعارات
            {unreadCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                {unreadCount}
              </span>
            )}
          </CardTitle>
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList>
              <TabsTrigger value="all">الكل</TabsTrigger>
              <TabsTrigger value="unread">غير مقروء</TabsTrigger>
              <TabsTrigger value="read">مقروء</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-sm text-muted-foreground">جاري تحميل التنبيهات...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Bell className="h-12 w-12 opacity-20 mb-4" />
              <p>لا توجد إشعارات لعرضها</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative flex items-start gap-4 rounded-lg border p-4 transition-all ${
                    !notification.isRead ? "bg-primary/5 border-primary/20 shadow-sm" : "bg-card hover:bg-accent/50"
                  }`}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`text-sm font-semibold ${!notification.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                        {notification.title}
                      </h4>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <Clock className="h-3 w-3" />
                        {new Date(notification.createdAt).toLocaleString('ar-IQ')}
                      </span>
                    </div>
                    <p className={`text-sm ${!notification.isRead ? "text-foreground/80" : "text-muted-foreground"}`}>
                      {notification.message}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="absolute top-1/2 -translate-y-1/2 right-4 w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Calendar, MapPin, Clock, FileText, Plus, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/sessions")({
  component: SessionsPage,
});

const SESSION_STATUS_LABELS: Record<number, string> = {
  1: "مجدولة",
  2: "منعقدة",
  3: "مؤرشفة",
};

function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.get("/sessions");
        setSessions(res.data.data);
      } catch (error) {
        toast.error("فشل في تحميل الجلسات");
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="اجتماعات اللجنة العلمية"
        description="إدارة وجدولة اجتماعات اللجنة لمناقشة البحوث والتقارير"
        actions={
          <Button className="bg-gradient-primary shadow-glow">
            <Plus className="me-2 h-4 w-4" />
            جدولة اجتماع جديد
          </Button>
        }
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p>جاري تحميل الجلسات...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sessions.length === 0 ? (
            <Card className="md:col-span-2 lg:col-span-3 py-12">
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <Calendar className="h-12 w-12 opacity-20 mb-4" />
                <p>لا توجد جلسات مجدولة حالياً</p>
              </div>
            </Card>
          ) : (
            sessions.map((session) => (
              <Card key={session.id} className="overflow-hidden transition-all hover:shadow-md">
                <CardHeader className="bg-muted/30 pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={session.status === 1 ? "default" : "secondary"}>
                      {SESSION_STATUS_LABELS[session.status] || "غير معروف"}
                    </Badge>
                    <span className="text-xs font-mono text-muted-foreground">#{session.number}</span>
                  </div>
                  <CardTitle className="mt-2 text-lg">اجتماع رقم {session.number}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 text-primary" />
                      {new Date(session.date).toLocaleDateString("ar-IQ")}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 text-primary" />
                      {session.time.substring(0, 5)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    {session.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4 text-primary" />
                    {session.submissionsCount} بحوث مدرجة للنقاش
                  </div>
                  <div className="pt-2 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">التفاصيل</Button>
                    {session.status === 1 && (
                      <Button size="sm" className="flex-1">بدء الجلسة</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

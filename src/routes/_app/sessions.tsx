import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Clock, MapPin, FileText, Plus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { mockSessions, SESSION_STATUS_LABELS } from "@/lib/mockData";

export const Route = createFileRoute("/_app/sessions")({
  component: SessionsPage,
});

const COLOR: Record<number, string> = {
  1: "bg-info/15 text-info border-info/30",
  2: "bg-success/15 text-success border-success/30",
  3: "bg-muted text-muted-foreground border-border",
};

function SessionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="الاجتماعات"
        description="إدارة اجتماعات اللجنة وجداول أعمالها"
        actions={<Button className="bg-gradient-primary shadow-glow"><Plus className="me-2 h-4 w-4" />اجتماع جديد</Button>}
      />

      <div className="space-y-4">
        {mockSessions.map((s) => (
          <Card key={s.id} className="transition-all hover:shadow-elegant">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                    <span className="text-xs">جلسة</span>
                    <span className="text-xl font-bold">{s.number}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="flex items-center gap-1"><Calendar className="h-4 w-4 text-muted-foreground" />{s.date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4 text-muted-foreground" />{s.time}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />{s.location}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className={COLOR[s.status]}>{SESSION_STATUS_LABELS[s.status]}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/40 p-3">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-primary" />
                  <span><strong>{s.submissionsCount}</strong> بحوث على جدول الأعمال</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">جدول الأعمال</Button>
                  {s.status === 2 && <Button size="sm">المحضر</Button>}
                  {s.status === 1 && <Button size="sm" className="bg-gradient-primary">إدارة الجلسة</Button>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

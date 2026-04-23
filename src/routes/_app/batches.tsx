import { createFileRoute } from "@tanstack/react-router";
import { Package, Send, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockBatches, BATCH_STATUS_LABELS } from "@/lib/mockData";

export const Route = createFileRoute("/_app/batches")({
  component: BatchesPage,
});

const STATUS_COLOR: Record<number, string> = {
  1: "bg-info/15 text-info border-info/30",
  2: "bg-warning/20 text-warning-foreground border-warning/40",
  3: "bg-primary/15 text-primary border-primary/30",
  4: "bg-success/15 text-success border-success/30",
  5: "bg-success/20 text-success border-success/40",
  6: "bg-muted text-muted-foreground border-border",
};

function BatchesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="الوجبات (الدرجة الثانية)"
        description="إدارة وجبات البحوث المرسلة للوزارة"
        actions={<Button className="bg-gradient-primary shadow-glow"><Package className="me-2 h-4 w-4" />وجبة جديدة</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockBatches.map((b) => (
          <Card key={b.id} className="transition-all hover:shadow-elegant">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">وجبة رقم</div>
                  <CardTitle className="text-3xl">{b.number}<span className="text-base text-muted-foreground">/{b.year}</span></CardTitle>
                </div>
                <Badge variant="outline" className={STATUS_COLOR[b.status]}>{BATCH_STATUS_LABELS[b.status]}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span>{b.submissionsCount} بحوث في الوجبة</span>
              </div>

              {b.outgoingNumber && (
                <div className="rounded-lg bg-muted/40 p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">رقم الصادر</span>
                    <span className="font-mono font-semibold">{b.outgoingNumber}</span>
                  </div>
                  <div className="mt-1 flex justify-between">
                    <span className="text-muted-foreground">التاريخ</span>
                    <span className="font-medium">{b.outgoingDate}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1">التفاصيل</Button>
                {b.status === 1 && <Button size="sm" className="flex-1"><Send className="me-1 h-3 w-3" />إرسال</Button>}
                {b.status === 4 && <Button size="sm" className="flex-1"><CheckCircle2 className="me-1 h-3 w-3" />إكمال</Button>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

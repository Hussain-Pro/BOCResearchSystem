import { createFileRoute } from "@tanstack/react-router";
import { ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockSubmissions, SUBMISSION_TYPE_LABELS } from "@/lib/mockData";

export const Route = createFileRoute("/_app/assigned")({
  component: AssignedPage,
});

function AssignedPage() {
  const items = mockSubmissions.filter((s) => s.committeeId === "c1");

  return (
    <div className="space-y-6">
      <PageHeader title="المراجعات الموكلة إليّ" description="البحوث التي أُسندت إليك للمراجعة في الاجتماعات" />

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((s) => (
          <Card key={s.id} className="transition-all hover:shadow-elegant">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-base leading-relaxed">{s.title}</CardTitle>
                <StatusBadge status={s.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">الموظف</div>
                  <div className="font-medium">{s.employeeName}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">النوع</div>
                  <div className="font-medium">{SUBMISSION_TYPE_LABELS[s.type]}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">تاريخ التقديم</div>
                  <div className="font-medium">{s.submittedAt}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">الدرجة الوظيفية</div>
                  <div className="font-medium">الدرجة {s.jobGrade}</div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1 bg-gradient-primary">
                  <ClipboardCheck className="me-2 h-4 w-4" />
                  مراجعة
                </Button>
                <Button size="sm" variant="outline" className="flex-1">عرض الملف</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

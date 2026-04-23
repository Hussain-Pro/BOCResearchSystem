import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Award, Save } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { mockSubmissions, EVALUATION_CRITERIA, SUBMISSION_TYPE_LABELS } from "@/lib/mockData";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/evaluations")({
  component: EvaluationsPage,
});

function EvaluationsPage() {
  const items = mockSubmissions.filter((s) => s.assignedEvaluatorId);
  const [active, setActive] = useState(items[0]?.id ?? "");
  const [scores, setScores] = useState<Record<number, string>>({});

  const total = EVALUATION_CRITERIA.reduce((sum, c) => sum + (Number(scores[c.id]) || 0), 0);
  const activeSub = items.find((s) => s.id === active);

  return (
    <div className="space-y-6">
      <PageHeader title="التقييمات" description="إدخال درجات تقييم البحوث المُسندة إليك" />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>البحوث المسندة</CardTitle></CardHeader>
          <CardContent className="space-y-2 p-3">
            {items.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`w-full rounded-lg border p-3 text-right transition-all ${active === s.id ? "border-primary bg-primary/5 shadow-card" : "hover:border-primary/40 hover:bg-accent/30"}`}
              >
                <div className="text-xs text-muted-foreground mb-1">{SUBMISSION_TYPE_LABELS[s.type]}</div>
                <div className="text-sm font-medium leading-relaxed">{s.title}</div>
                <div className="mt-2 text-xs text-muted-foreground">{s.employeeName}</div>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          {activeSub && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    معايير التقييم — {activeSub.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {EVALUATION_CRITERIA.map((c) => (
                    <div key={c.id} className="rounded-lg border bg-card/50 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <label className="font-medium">{c.id}. {c.name}</label>
                        <span className="text-sm font-semibold text-muted-foreground">من {c.max}</span>
                      </div>
                      <Input
                        type="number"
                        min={0}
                        max={c.max}
                        value={scores[c.id] ?? ""}
                        onChange={(e) => setScores({ ...scores, [c.id]: e.target.value })}
                        placeholder={`أدخل درجة (0 - ${c.max})`}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>ملاحظات المُقيِّم</CardTitle></CardHeader>
                <CardContent>
                  <Textarea rows={4} placeholder="ملاحظاتك حول البحث..." />
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/10 to-transparent">
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <div className="text-sm text-muted-foreground">المجموع الكلي</div>
                    <div className="text-4xl font-bold text-primary">{total}<span className="text-xl text-muted-foreground">/100</span></div>
                  </div>
                  <Button size="lg" className="bg-gradient-primary shadow-glow" onClick={() => toast.success("تم حفظ التقييم بنجاح")}>
                    <Save className="me-2 h-4 w-4" />
                    حفظ التقييم
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

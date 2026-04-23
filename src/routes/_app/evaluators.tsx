import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Building2, GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockUsers } from "@/lib/mockData";

export const Route = createFileRoute("/_app/evaluators")({
  component: EvaluatorsPage,
});

function EvaluatorsPage() {
  const evaluators = mockUsers.filter((u) => u.role === "Evaluator");
  const pendingRequests = [
    { id: "r1", name: "د. عمر الكناني", institution: "جامعة البصرة", specialization: "هندسة كيمياوية" },
    { id: "r2", name: "د. ليلى صالح", institution: "جامعة المثنى", specialization: "هندسة نفط" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="إدارة المُقيِّمين" description="المُقيِّمون النشطون والطلبات المعلقة" />

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">المُقيِّمون النشطون</h3>
          <div className="space-y-3">
            {evaluators.map((e) => (
              <Card key={e.id}>
                <CardContent className="flex items-center gap-4 p-4">
                  <Avatar className="h-12 w-12 ring-2 ring-success/30">
                    <AvatarFallback className="bg-success/10 text-success">{e.fullName.split(" ")[1]?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold">{e.fullName}</div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{e.department}</span>
                      <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />{e.qualification}</span>
                    </div>
                  </div>
                  <Badge className="bg-success/15 text-success border-success/30" variant="outline"><ShieldCheck className="me-1 h-3 w-3" />نشط</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">طلبات الانضمام المعلقة</h3>
          <div className="space-y-3">
            {pendingRequests.map((r) => (
              <Card key={r.id} className="bg-gradient-to-br from-warning/5 to-transparent">
                <CardHeader>
                  <CardTitle className="text-base">{r.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm text-muted-foreground">{r.institution} — {r.specialization}</div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1 bg-success hover:bg-success/90 text-success-foreground">قبول</Button>
                    <Button size="sm" variant="outline" className="flex-1">رفض</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

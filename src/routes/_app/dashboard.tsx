import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, FilePlus2, CheckCircle2, Clock, TrendingUp, Users, Calendar, Award } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockSubmissions, mockSessions, ROLE_LABELS, SUBMISSION_TYPE_LABELS } from "@/lib/mockData";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;

  const isEmployee = user.role === "Employee";
  const mySubs = isEmployee ? mockSubmissions.filter((s) => s.employeeId === user.id) : mockSubmissions;
  const successCount = mySubs.filter((s) => s.status === 4 || s.status === 11).length;
  const pendingCount = mySubs.filter((s) => s.status === 1 || s.status === 2 || s.status === 8).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`أهلاً، ${user.fullName.split(" ").slice(0, 2).join(" ")}`}
        description={`لوحة ${ROLE_LABELS[user.role]} — نظرة سريعة على نشاطك في النظام`}
        actions={
          isEmployee ? (
            <Button asChild className="bg-gradient-primary shadow-glow">
              <Link to="/submit">
                <FilePlus2 className="me-2 h-4 w-4" />
                تقديم بحث جديد
              </Link>
            </Button>
          ) : null
        }
      />

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title={isEmployee ? "بحوثي" : "إجمالي التقديمات"} value={mySubs.length} icon={FileText} variant="primary" trend="هذه السنة" />
        <StatCard title="قيد المعالجة" value={pendingCount} icon={Clock} variant="warning" trend="بحاجة للمتابعة" />
        <StatCard title={isEmployee ? "بحوث ناجحة" : "ناجحة/مستوفية"} value={successCount} icon={CheckCircle2} variant="success" trend="مقبولة للترقية" />
        <StatCard title="اجتماعات قادمة" value={mockSessions.filter((s) => s.status === 1).length} icon={Calendar} variant="info" trend="هذا الشهر" />
      </div>

      {/* Two column layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>{isEmployee ? "آخر بحوثي" : "آخر التقديمات"}</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to={isEmployee ? "/my-submissions" : "/submissions"}>عرض الكل</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {mySubs.slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-start justify-between gap-4 rounded-lg border bg-card/50 p-3 transition-colors hover:bg-accent/30">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                      {SUBMISSION_TYPE_LABELS[s.type]}
                    </span>
                    <span className="text-xs text-muted-foreground">{s.submittedAt}</span>
                  </div>
                  <h4 className="mt-1 truncate font-semibold">{s.title}</h4>
                  {!isEmployee && <p className="mt-0.5 text-xs text-muted-foreground">{s.employeeName}</p>}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <StatusBadge status={s.status} />
                  {s.finalScore != null && (
                    <span className="text-sm font-bold text-primary">{s.finalScore.toFixed(0)}/100</span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>النشاط القادم</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockSessions.filter((s) => s.status === 1).map((s) => (
              <div key={s.id} className="rounded-lg border bg-gradient-to-br from-info/5 to-transparent p-3">
                <div className="flex items-center gap-2 text-info">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs font-semibold">اجتماع رقم {s.number}</span>
                </div>
                <div className="mt-2 text-sm font-medium">{s.date} — {s.time}</div>
                <p className="mt-1 text-xs text-muted-foreground">{s.location}</p>
                <p className="mt-2 text-xs">{s.submissionsCount} بحوث على جدول الأعمال</p>
              </div>
            ))}

            {isEmployee && (
              <div className="rounded-lg border bg-gradient-to-br from-primary/5 to-transparent p-4">
                <div className="flex items-center gap-2 text-primary">
                  <Award className="h-4 w-4" />
                  <span className="text-xs font-semibold">حالة الأهلية للترقية</span>
                </div>
                <p className="mt-2 text-sm">
                  أنت مؤهّل لتقديم البحوث ضمن مدة التغيير الحالية.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <span>تاريخ التغيير الأخير: {user.lastGradeChangeDate}</span>
                </div>
              </div>
            )}

            {!isEmployee && (
              <div className="rounded-lg border bg-gradient-to-br from-success/5 to-transparent p-4">
                <div className="flex items-center gap-2 text-success">
                  <Users className="h-4 w-4" />
                  <span className="text-xs font-semibold">أعضاء اللجنة</span>
                </div>
                <p className="mt-2 text-sm">7 أعضاء نشطين</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

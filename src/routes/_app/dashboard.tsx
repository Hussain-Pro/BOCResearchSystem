import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  FileText, FilePlus2, CheckCircle2, Clock, TrendingUp, Users, Calendar, Award,
  Loader2, Inbox, ClipboardCheck, Gavel, ShieldCheck, Database, Send, AlertCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { SubmissionTimeline } from "@/components/SubmissionTimeline";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  mockSessions, ROLE_LABELS, SUBMISSION_TYPE_LABELS, mockBatches, mockUsers,
  BATCH_STATUS_LABELS,
} from "@/lib/mockData";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchSubmissions = async () => {
      try {
        const url = user.role === "Employee" ? "/submissions/my" : "/submissions";
        const response = await api.get(url);
        setSubmissions(response.data.data);
      } catch (error) {
        console.error("Failed to fetch submissions", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`أهلاً، ${user.fullName.split(" ").slice(0, 2).join(" ")}`}
        description={`لوحة ${(ROLE_LABELS as Record<string, string>)[user.role] ?? user.role} — نظرة سريعة على نشاطك في النظام`}
        actions={<RoleHeaderAction role={user.role} />}
      />

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <RoleDashboard role={user.role} user={user} submissions={submissions} />
      )}
    </div>
  );
}

function RoleHeaderAction({ role }: { role: string }) {
  if (role === "Employee") {
    return (
      <Button asChild className="bg-gradient-primary shadow-glow">
        <Link to="/submit">
          <FilePlus2 className="me-2 h-4 w-4" /> تقديم بحث جديد
        </Link>
      </Button>
    );
  }
  if (role === "Secretary" || role === "DataEntry") {
    return (
      <Button asChild className="bg-gradient-primary shadow-glow">
        <Link to="/sessions">
          <Calendar className="me-2 h-4 w-4" /> جدولة اجتماع
        </Link>
      </Button>
    );
  }
  if (role === "CommitteeHead" || role === "CommitteeDeputy" || role === "OriginalMember") {
    return (
      <Button asChild className="bg-gradient-primary shadow-glow">
        <Link to="/assigned">
          <ClipboardCheck className="me-2 h-4 w-4" /> المراجعات الموكلة
        </Link>
      </Button>
    );
  }
  if (role === "Evaluator") {
    return (
      <Button asChild className="bg-gradient-primary shadow-glow">
        <Link to="/evaluations">
          <Award className="me-2 h-4 w-4" /> بحوث للتقييم
        </Link>
      </Button>
    );
  }
  return null;
}

// ====== Per-role layouts ======

function RoleDashboard({ role, user, submissions }: { role: string; user: any; submissions: any[] }) {
  switch (role) {
    case "Employee":     return <EmployeeDashboard user={user} submissions={submissions} />;
    case "Evaluator":    return <EvaluatorDashboard submissions={submissions} />;
    case "CommitteeHead":
    case "CommitteeDeputy":
    case "OriginalMember": return <MemberDashboard submissions={submissions} />;
    case "Secretary":    return <SecretaryDashboard submissions={submissions} />;
    case "SystemSupervisor": return <AdminDashboard submissions={submissions} />;
    case "DataEntry":    return <DataEntryDashboard submissions={submissions} />;
    case "Assistant":    return <AssistantDashboard submissions={submissions} />;
    default:             return <EmployeeDashboard user={user} submissions={submissions} />;
  }
}

// ----- Employee -----
function EmployeeDashboard({ user, submissions }: { user: any; submissions: any[] }) {
  const total = submissions.length;
  const success = submissions.filter((s) => s.status === 4 || s.status === 11).length;
  const pending = submissions.filter((s) => [1, 2, 7, 8].includes(s.status)).length;
  const rejected = submissions.filter((s) => [3, 5, 6].includes(s.status)).length;
  const lastChange = user.lastGradeChangeDate ? new Date(user.lastGradeChangeDate).toLocaleDateString("ar-IQ") : "غير محدد";
  const eligible = user.eligibleDate ? new Date(user.eligibleDate).toLocaleDateString("ar-IQ") : "غير محدد";
  const latest = submissions[0];

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="إجمالي بحوثي" value={total} icon={FileText} variant="primary" trend="هذه السنة" />
        <StatCard title="قيد المعالجة" value={pending} icon={Clock} variant="warning" trend="بحاجة للمتابعة" />
        <StatCard title="بحوث ناجحة" value={success} icon={CheckCircle2} variant="success" trend="مقبولة للترقية" />
        <StatCard title="مرفوضة / غير ناجحة" value={rejected} icon={AlertCircle} variant="info" trend="بحاجة لإعادة" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>آخر بحوثي</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/my-submissions">عرض الكل</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <SubmissionsList items={submissions.slice(0, 5)} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">حالة الأهلية للترقية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3" /> آخر تغيير للدرجة: {lastChange}
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-primary">
                <Clock className="h-3 w-3" /> تاريخ الاستحقاق: {eligible}
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs">
                  <span>تقدّمك في الفترة الحالية</span>
                  <span className="font-semibold text-primary">{success}/3</span>
                </div>
                <Progress value={Math.min(100, (success / 3) * 100)} />
              </div>
            </CardContent>
          </Card>

          {latest && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">مسار آخر بحث</CardTitle>
                <CardDescription className="line-clamp-1">{latest.title}</CardDescription>
              </CardHeader>
              <CardContent>
                <SubmissionTimeline status={latest.status} submittedAt={latest.submittedAt} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

// ----- Evaluator -----
function EvaluatorDashboard({ submissions }: { submissions: any[] }) {
  const assigned = submissions.length;
  const done = submissions.filter((s) => s.evaluatorScore != null).length;
  const pending = assigned - done;
  const avg = done ? Math.round(submissions.reduce((a, s) => a + (s.evaluatorScore ?? 0), 0) / done) : 0;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="بحوث مُسندة لي" value={assigned} icon={Inbox} variant="primary" trend="إجمالي" />
        <StatCard title="بانتظار التقييم" value={pending} icon={Clock} variant="warning" trend="عاجل" />
        <StatCard title="مكتملة" value={done} icon={CheckCircle2} variant="success" trend="تم التقييم" />
        <StatCard title="متوسط درجاتي" value={`${avg}/100`} icon={Award} variant="info" trend="آخر 30 يوم" />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>قائمة التقييم الخاصة بك</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/evaluations">انتقل لصفحة التقييم</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <SubmissionsList items={submissions.slice(0, 6)} showScore />
        </CardContent>
      </Card>
    </>
  );
}

// ----- Member / Head / Deputy -----
function MemberDashboard({ submissions }: { submissions: any[] }) {
  const upcoming = mockSessions.filter((s) => s.status === 1);
  const pendingReview = submissions.filter((s) => [1, 7, 8].includes(s.status)).length;
  const evaluated = submissions.filter((s) => s.evaluatorScore != null && s.committeeScore == null).length;
  const decided = submissions.filter((s) => [4, 5, 11].includes(s.status)).length;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="بحوث للمراجعة" value={pendingReview} icon={ClipboardCheck} variant="warning" trend="بحاجة قرار" />
        <StatCard title="بانتظار درجة اللجنة" value={evaluated} icon={Gavel} variant="info" trend="تم تقييم المُقيِّم" />
        <StatCard title="قرارات هذا الشهر" value={decided} icon={CheckCircle2} variant="success" trend="ناجحة/مستوفية" />
        <StatCard title="اجتماعات قادمة" value={upcoming.length} icon={Calendar} variant="primary" trend="هذا الشهر" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>أعمال بانتظار قرارك</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/assigned">جميع الموكلة</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <SubmissionsList items={submissions.filter((s) => [1, 2, 7, 8].includes(s.status)).slice(0, 5)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">الاجتماعات القادمة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا توجد اجتماعات مجدولة</p>
            ) : (
              upcoming.map((s) => (
                <div key={s.id} className="rounded-lg border bg-gradient-to-br from-info/5 to-transparent p-3">
                  <div className="flex items-center gap-2 text-info">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs font-semibold">اجتماع رقم {s.number}</span>
                  </div>
                  <div className="mt-2 text-sm font-medium">{s.date} — {s.time}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{s.location}</p>
                  <p className="mt-2 text-xs">{s.submissionsCount} بحوث على جدول الأعمال</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// ----- Secretary -----
function SecretaryDashboard({ submissions }: { submissions: any[] }) {
  const newCount = submissions.filter((s) => s.status === 1).length;
  const upcoming = mockSessions.filter((s) => s.status === 1);
  const activeBatch = mockBatches.find((b) => b.status === 1) ?? mockBatches[0];

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="بحوث جديدة" value={newCount} icon={Inbox} variant="primary" trend="بحاجة لتسجيل" />
        <StatCard title="اجتماعات قادمة" value={upcoming.length} icon={Calendar} variant="info" trend="مجدولة" />
        <StatCard title="وجبات نشطة" value={mockBatches.filter((b) => b.status !== 5 && b.status !== 6).length} icon={Send} variant="warning" trend="قيد الإرسال" />
        <StatCard title="إجمالي البحوث" value={submissions.length} icon={FileText} variant="success" trend="هذه السنة" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>قائمة البحوث الجديدة</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/submissions">عرض الكل</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <SubmissionsList items={submissions.filter((s) => [1, 8].includes(s.status)).slice(0, 5)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">الوجبة الحالية</CardTitle>
            <CardDescription>وجبة رقم {activeBatch?.number} / {activeBatch?.year}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">الحالة</span>
              <span className="font-semibold">{BATCH_STATUS_LABELS[activeBatch?.status ?? 1]}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">عدد البحوث</span>
              <span className="font-semibold">{activeBatch?.submissionsCount ?? 0}</span>
            </div>
            <Button asChild variant="outline" size="sm" className="mt-3 w-full">
              <Link to="/batches">إدارة الوجبات</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// ----- System Supervisor (Admin) -----
function AdminDashboard({ submissions }: { submissions: any[] }) {
  const usersCount = mockUsers.length;
  const sessionsCount = mockSessions.length;
  const successRate = submissions.length
    ? Math.round((submissions.filter((s) => [4, 11].includes(s.status)).length / submissions.length) * 100)
    : 0;

  const byRole = useMemo(() => {
    const counts: Record<string, number> = {};
    mockUsers.forEach((u) => { counts[u.role] = (counts[u.role] ?? 0) + 1; });
    return Object.entries(counts);
  }, []);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="إجمالي المستخدمين" value={usersCount} icon={Users} variant="primary" trend="نشطون" />
        <StatCard title="إجمالي البحوث" value={submissions.length} icon={FileText} variant="info" trend="هذه السنة" />
        <StatCard title="نسبة النجاح" value={`${successRate}%`} icon={TrendingUp} variant="success" trend="عام" />
        <StatCard title="الاجتماعات" value={sessionsCount} icon={Calendar} variant="warning" trend="إجمالي" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>توزيع المستخدمين حسب الدور</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {byRole.map(([role, count]) => {
              const pct = Math.round((count / usersCount) * 100);
              return (
                <div key={role}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium">{(ROLE_LABELS as Record<string, string>)[role] ?? role}</span>
                    <span className="text-muted-foreground">{count} ({pct}%)</span>
                  </div>
                  <Progress value={pct} />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">إجراءات سريعة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <QuickAction icon={Users} label="إدارة المستخدمين" to="/users" />
            <QuickAction icon={ShieldCheck} label="سجل التدقيق" to="/audit-logs" />
            <QuickAction icon={Calendar} label="الاجتماعات" to="/sessions" />
            <QuickAction icon={Send} label="الوجبات" to="/batches" />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// ----- Data Entry -----
function DataEntryDashboard({ submissions }: { submissions: any[] }) {
  const newCount = submissions.filter((s) => s.status === 1).length;
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="بانتظار الإدخال" value={newCount} icon={Database} variant="warning" trend="عاجل" />
        <StatCard title="أُدخل اليوم" value={3} icon={CheckCircle2} variant="success" trend="إنجازك" />
        <StatCard title="إجمالي البحوث" value={submissions.length} icon={FileText} variant="primary" trend="هذه السنة" />
        <StatCard title="ملفات مرفوعة" value={submissions.length * 2} icon={FilePlus2} variant="info" trend="PDF" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>بحوث بانتظار الإدخال</CardTitle>
        </CardHeader>
        <CardContent>
          <SubmissionsList items={submissions.filter((s) => s.status === 1).slice(0, 6)} />
        </CardContent>
      </Card>
    </>
  );
}

// ----- Assistant -----
function AssistantDashboard({ submissions }: { submissions: any[] }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="مهام مساندة" value={5} icon={ClipboardCheck} variant="primary" trend="هذا الأسبوع" />
        <StatCard title="ملفات للأرشفة" value={12} icon={Database} variant="info" trend="بانتظار" />
        <StatCard title="اجتماعات لتنظيمها" value={mockSessions.filter((s) => s.status === 1).length} icon={Calendar} variant="warning" trend="قادمة" />
        <StatCard title="إجمالي البحوث" value={submissions.length} icon={FileText} variant="success" trend="نشطة" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>أحدث النشاطات في النظام</CardTitle>
        </CardHeader>
        <CardContent>
          <SubmissionsList items={submissions.slice(0, 5)} />
        </CardContent>
      </Card>
    </>
  );
}

// ====== shared blocks ======

function SubmissionsList({ items, showScore }: { items: any[]; showScore?: boolean }) {
  if (items.length === 0) {
    return <div className="py-8 text-center text-sm text-muted-foreground">لا توجد عناصر</div>;
  }
  return (
    <>
      {items.map((s) => (
        <div key={s.id} className="flex items-start justify-between gap-4 rounded-lg border bg-card/50 p-3 transition-colors hover:bg-accent/30">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                {(SUBMISSION_TYPE_LABELS as any)[s.submissionType ?? s.type]}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(s.submittedAt).toLocaleDateString("ar-IQ")}
              </span>
            </div>
            <h4 className="mt-1 truncate font-semibold">{s.title}</h4>
            {s.employeeName && <p className="mt-0.5 text-xs text-muted-foreground">{s.employeeName}</p>}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <StatusBadge status={s.status} />
            {(showScore ? s.evaluatorScore : s.finalScore) != null && (
              <span className="text-sm font-bold text-primary">
                {(showScore ? s.evaluatorScore : s.finalScore).toFixed(0)}/100
              </span>
            )}
          </div>
        </div>
      ))}
    </>
  );
}

function QuickAction({ icon: Icon, label, to }: { icon: typeof Users; label: string; to: any }) {
  return (
    <Button asChild variant="outline" className="w-full justify-start gap-2">
      <Link to={to}>
        <Avatar className="h-7 w-7">
          <AvatarFallback className="bg-primary/10 text-primary">
            <Icon className="h-3.5 w-3.5" />
          </AvatarFallback>
        </Avatar>
        {label}
      </Link>
    </Button>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Calendar, FileText, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SUBMISSION_TYPE_LABELS } from "@/lib/mockData";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/submissions/$id")({
  component: SubmissionDetailPage,
});

type TimelineEntry = { label: string; at: string; detail?: string | null };

type Detail = {
  id: number;
  title: string;
  status: number;
  type: number;
  submittedAt: string;
  employeeName?: string | null;
  finalScore?: number | null;
  timeline: TimelineEntry[];
};

function SubmissionDetailPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const backTo = user?.role === "Employee" ? "/my-submissions" : "/submissions";

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/submissions/${id}`);
        setDetail(res.data.data);
      } catch {
        toast.error("تعذر تحميل التقديم");
        setDetail(null);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="تفاصيل التقديم"
        description="المسار الزمني والحالة الحالية"
        actions={
          <Button variant="outline" asChild>
            <Link to={backTo}>
              <ArrowRight className="me-2 h-4 w-4 rotate-180" />
              {user?.role === "Employee" ? "رجوع لبحوثي" : "رجوع للقائمة"}
            </Link>
          </Button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !detail ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">التقديم غير موجود</CardContent></Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                {detail.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="rounded-md bg-secondary px-2 py-1 text-secondary-foreground">
                  {(SUBMISSION_TYPE_LABELS as Record<string, string>)[String(detail.type)]}
                </span>
                <StatusBadge status={detail.status} />
                {detail.finalScore != null && (
                  <span className="font-bold text-primary">{Number(detail.finalScore).toFixed(0)}/100</span>
                )}
              </div>
              {detail.employeeName && (
                <p className="text-sm text-muted-foreground">الموظف: {detail.employeeName}</p>
              )}
              <p className="text-sm text-muted-foreground">
                تاريخ التقديم: {new Date(detail.submittedAt).toLocaleString("ar-IQ")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4" />
                المسار الزمني
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="relative border-s border-border pe-4 space-y-6">
                {detail.timeline.map((step, i) => (
                  <li key={`${step.label}-${i}`} className="ms-4">
                    <span className="absolute -start-1.5 mt-1.5 flex h-3 w-3 rounded-full border border-primary bg-background" />
                    <div className="text-sm font-medium">{step.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(step.at).toLocaleString("ar-IQ")}
                    </div>
                    {step.detail && (
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{step.detail}</p>
                    )}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

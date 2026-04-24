import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, Filter, Download, Loader2, Eye } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUBMISSION_TYPE_LABELS, SUBMISSION_STATUS_LABELS } from "@/lib/mockData";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/submissions")({
  component: SubmissionsPage,
});

function SubmissionsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await api.get("/submissions");
        setSubmissions(res.data.data);
      } catch (error) {
        toast.error("فشل في تحميل التقديمات");
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const items = submissions
    .filter((s) => s.title.toLowerCase().includes(search.toLowerCase()) || s.employeeName?.toLowerCase().includes(search.toLowerCase()))
    .filter((s) => statusFilter === "all" || s.status === Number(statusFilter));

  return (
    <div className="space-y-6">
      <PageHeader
        title="جميع التقديمات"
        description="عرض وإدارة كل التقديمات في النظام"
        actions={<Button variant="outline"><Download className="me-2 h-4 w-4" />تصدير</Button>}
      />

      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث بالعنوان أو اسم الموظف..." className="pr-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <Filter className="me-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              {Object.entries(SUBMISSION_STATUS_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p>جاري تحميل البيانات...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>العنوان</TableHead>
                <TableHead>الموظف</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>تاريخ التقديم</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الدرجة النهائية</TableHead>
                <TableHead className="text-end">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    لا يوجد نتائج للبحث الحالي
                  </TableCell>
                </TableRow>
              ) : (
                items.map((s) => (
                  <TableRow key={s.id} className="hover:bg-accent/30">
                    <TableCell className="max-w-xs"><div className="truncate font-medium">{s.title}</div></TableCell>
                    <TableCell className="text-sm">{s.employeeName || s.employeeId}</TableCell>
                    <TableCell className="text-sm">{(SUBMISSION_TYPE_LABELS as any)[s.submissionType]}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(s.submittedAt).toLocaleDateString("ar-IQ")}</TableCell>
                    <TableCell><StatusBadge status={s.status} /></TableCell>
                    <TableCell>
                      {s.finalScore != null ? (
                        <span className="font-bold text-primary">{s.finalScore.toFixed(0)}/100</span>
                      ) : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-end">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/submissions/${s.id}`}>
                           <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

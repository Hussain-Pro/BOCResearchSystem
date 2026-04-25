import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { FilePlus2, Search, Filter, FileText, Loader2, Eye } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { SubmissionTimeline } from "@/components/SubmissionTimeline";
import { DataTablePagination } from "@/components/DataTablePagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import { SUBMISSION_TYPE_LABELS } from "@/lib/mockData";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/my-submissions")({
  component: MySubmissions,
});

function MySubmissions() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [openItem, setOpenItem] = useState<any | null>(null);

  useEffect(() => {
    const fetchMySubmissions = async () => {
      if (!user) return;
      try {
        const res = await api.get("/submissions/my");
        setSubmissions(res.data.data);
      } catch {
        toast.error("فشل في تحميل بحوثك");
      } finally {
        setLoading(false);
      }
    };
    fetchMySubmissions();
  }, [user]);

  const items = useMemo(
    () =>
      submissions
        .filter((s) => s.title.toLowerCase().includes(search.toLowerCase()))
        .filter((s) => typeFilter === "all" || (s.submissionType ?? s.type) === Number(typeFilter)),
    [submissions, search, typeFilter],
  );

  useEffect(() => { setPage(1); }, [search, typeFilter, pageSize]);

  const paginated = items.slice((page - 1) * pageSize, page * pageSize);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="بحوثي"
        description="جميع بحوثك المقدمة وحالاتها الحالية"
        actions={
          <Button asChild className="bg-gradient-primary shadow-glow">
            <Link to="/submit"><FilePlus2 className="me-2 h-4 w-4" />تقديم جديد</Link>
          </Button>
        }
      />

      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث بعنوان البحث..." className="pr-10" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="me-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأنواع</SelectItem>
              {Object.entries(SUBMISSION_TYPE_LABELS).map(([k, v]) => (
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
            <p>جاري تحميل بحوثك...</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>العنوان</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>تاريخ التقديم</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الدرجة</TableHead>
                  <TableHead className="text-end">المسار</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                      <FileText className="mx-auto mb-2 h-8 w-8 opacity-30" />
                      لا توجد بحوث مطابقة
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((s) => (
                    <TableRow key={s.id} className="hover:bg-accent/30">
                      <TableCell className="max-w-md">
                        <div className="font-medium">{s.title}</div>
                      </TableCell>
                      <TableCell>{(SUBMISSION_TYPE_LABELS as any)[s.submissionType ?? s.type]}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(s.submittedAt).toLocaleDateString("ar-IQ")}</TableCell>
                      <TableCell><StatusBadge status={s.status} /></TableCell>
                      <TableCell>
                        {s.finalScore != null ? (
                          <span className="font-bold text-primary">{s.finalScore.toFixed(0)}/100</span>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-end">
                        <Button variant="ghost" size="sm" onClick={() => setOpenItem(s)} className="gap-1">
                          <Eye className="h-4 w-4" />
                          المسار
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <DataTablePagination
              page={page}
              pageSize={pageSize}
              total={items.length}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </>
        )}
      </Card>

      <Dialog open={!!openItem} onOpenChange={(o) => !o && setOpenItem(null)}>
        <DialogContent dir="rtl" className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">{openItem?.title}</DialogTitle>
            <DialogDescription>
              {openItem && (SUBMISSION_TYPE_LABELS as any)[openItem.submissionType ?? openItem.type]} •{" "}
              {openItem && new Date(openItem.submittedAt).toLocaleDateString("ar-IQ")}
            </DialogDescription>
          </DialogHeader>
          {openItem && (
            <div className="rounded-xl border bg-muted/20 p-4">
              <h4 className="mb-3 text-sm font-semibold">مسار البحث</h4>
              <SubmissionTimeline status={openItem.status} submittedAt={openItem.submittedAt} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

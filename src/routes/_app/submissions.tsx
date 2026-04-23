import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Filter, Download } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockSubmissions, SUBMISSION_TYPE_LABELS, SUBMISSION_STATUS_LABELS, type SubmissionStatus } from "@/lib/mockData";

export const Route = createFileRoute("/_app/submissions")({
  component: SubmissionsPage,
});

function SubmissionsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const items = mockSubmissions
    .filter((s) => s.title.includes(search) || s.employeeName.includes(search))
    .filter((s) => statusFilter === "all" || s.status === Number(statusFilter) as SubmissionStatus);

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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>العنوان</TableHead>
              <TableHead>الموظف</TableHead>
              <TableHead>الدرجة الوظيفية</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>تاريخ التقديم</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الدرجة النهائية</TableHead>
              <TableHead className="text-end">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((s) => (
              <TableRow key={s.id} className="hover:bg-accent/30">
                <TableCell className="max-w-xs"><div className="truncate font-medium">{s.title}</div></TableCell>
                <TableCell className="text-sm">{s.employeeName}</TableCell>
                <TableCell className="text-center"><span className="rounded bg-secondary px-2 py-0.5 text-xs">{s.jobGrade}</span></TableCell>
                <TableCell className="text-sm">{SUBMISSION_TYPE_LABELS[s.type]}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{s.submittedAt}</TableCell>
                <TableCell><StatusBadge status={s.status} /></TableCell>
                <TableCell>
                  {s.finalScore != null ? (
                    <span className="font-bold text-primary">{s.finalScore.toFixed(0)}/100</span>
                  ) : <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell className="text-end">
                  <Button variant="ghost" size="sm">إدارة</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

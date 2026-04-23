import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { FilePlus2, Search, Filter, FileText } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { mockSubmissions, SUBMISSION_TYPE_LABELS, type SubmissionType } from "@/lib/mockData";

export const Route = createFileRoute("/_app/my-submissions")({
  component: MySubmissions,
});

function MySubmissions() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  if (!user) return null;
  const items = mockSubmissions
    .filter((s) => s.employeeId === user.id || user.role !== "Employee")
    .filter((s) => s.title.includes(search))
    .filter((s) => typeFilter === "all" || s.type === Number(typeFilter) as SubmissionType);

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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>العنوان</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>تاريخ التقديم</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الدرجة</TableHead>
              <TableHead className="text-end">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                  <FileText className="mx-auto mb-2 h-8 w-8 opacity-30" />
                  لا توجد بحوث مطابقة
                </TableCell>
              </TableRow>
            )}
            {items.map((s) => (
              <TableRow key={s.id} className="hover:bg-accent/30">
                <TableCell className="max-w-md">
                  <div className="font-medium">{s.title}</div>
                </TableCell>
                <TableCell>{SUBMISSION_TYPE_LABELS[s.type]}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{s.submittedAt}</TableCell>
                <TableCell><StatusBadge status={s.status} /></TableCell>
                <TableCell>
                  {s.finalScore != null ? (
                    <span className="font-bold text-primary">{s.finalScore.toFixed(0)}/100</span>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell className="text-end">
                  <Button variant="ghost" size="sm">عرض</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

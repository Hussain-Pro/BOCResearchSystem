import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ClipboardCheck, UserPlus, FileText, Filter, Search, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  mockSubmissions,
  mockUsers,
  SUBMISSION_TYPE_LABELS,
  SUBMISSION_STATUS_LABELS,
  type MockSubmission,
  type SubmissionStatus,
} from "@/lib/mockData";

export const Route = createFileRoute("/_app/assigned")({
  component: AssignedPage,
});

const STATUS_OPTIONS: SubmissionStatus[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

function AssignedPage() {
  const evaluators = useMemo(
    () => mockUsers.filter((u) => u.role === "Evaluator"),
    [],
  );

  const [items, setItems] = useState<MockSubmission[]>(() =>
    mockSubmissions.filter((s) => s.committeeId === "c1"),
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    submission: MockSubmission | null;
    nextStatus: SubmissionStatus | null;
    note: string;
  }>({ open: false, submission: null, nextStatus: null, note: "" });

  const [assignDialog, setAssignDialog] = useState<{
    open: boolean;
    submission: MockSubmission | null;
    evaluatorId: string;
    deadline: string;
    instructions: string;
  }>({
    open: false,
    submission: null,
    evaluatorId: "",
    deadline: "",
    instructions: "",
  });

  const filtered = items.filter((s) => {
    const matchSearch =
      !search ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.employeeName.includes(search);
    const matchStatus =
      statusFilter === "all" || String(s.status) === statusFilter;
    return matchSearch && matchStatus;
  });

  const openStatusDialog = (submission: MockSubmission) => {
    setStatusDialog({
      open: true,
      submission,
      nextStatus: submission.status,
      note: "",
    });
  };

  const confirmStatusChange = () => {
    if (!statusDialog.submission || !statusDialog.nextStatus) return;
    const id = statusDialog.submission.id;
    const next = statusDialog.nextStatus;
    setItems((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: next, notes: statusDialog.note || s.notes }
          : s,
      ),
    );
    toast.success("تم تحديث الحالة", {
      description: `${statusDialog.submission.title} → ${SUBMISSION_STATUS_LABELS[next]}`,
    });
    setStatusDialog({ open: false, submission: null, nextStatus: null, note: "" });
  };

  const openAssignDialog = (submission: MockSubmission) => {
    setAssignDialog({
      open: true,
      submission,
      evaluatorId: submission.assignedEvaluatorId ?? "",
      deadline: "",
      instructions: "",
    });
  };

  const confirmAssign = () => {
    if (!assignDialog.submission || !assignDialog.evaluatorId) {
      toast.error("الرجاء اختيار مُقيِّم");
      return;
    }
    const id = assignDialog.submission.id;
    const evId = assignDialog.evaluatorId;
    setItems((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, assignedEvaluatorId: evId } : s,
      ),
    );
    const evName = evaluators.find((e) => e.id === evId)?.fullName ?? "";
    toast.success("تم إسناد المهمة", {
      description: `أُسند البحث إلى ${evName}`,
    });
    setAssignDialog({
      open: false,
      submission: null,
      evaluatorId: "",
      deadline: "",
      instructions: "",
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="المراجعات الموكلة إليّ"
        description="مراجعة البحوث، تغيير حالاتها، وإسنادها إلى المُقيِّمين"
      />

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ابحث بعنوان البحث أو اسم الموظف..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pe-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                {STATUS_OPTIONS.map((st) => (
                  <SelectItem key={st} value={String(st)}>
                    {SUBMISSION_STATUS_LABELS[st]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.length === 0 && (
          <Card className="md:col-span-2">
            <CardContent className="p-10 text-center text-muted-foreground">
              لا توجد بحوث مطابقة للفلترة الحالية
            </CardContent>
          </Card>
        )}

        {filtered.map((s) => {
          const evaluator = evaluators.find((e) => e.id === s.assignedEvaluatorId);
          return (
            <Card key={s.id} className="transition-all hover:shadow-elegant">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base leading-relaxed">
                    {s.title}
                  </CardTitle>
                  <StatusBadge status={s.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground">الموظف</div>
                    <div className="font-medium">{s.employeeName}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">النوع</div>
                    <div className="font-medium">
                      {SUBMISSION_TYPE_LABELS[s.type]}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      تاريخ التقديم
                    </div>
                    <div className="font-medium">{s.submittedAt}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      الدرجة الوظيفية
                    </div>
                    <div className="font-medium">الدرجة {s.jobGrade}</div>
                  </div>
                </div>

                {/* Evaluator slot */}
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="mb-2 text-xs font-semibold text-muted-foreground">
                    المُقيِّم المُسنَد
                  </div>
                  {evaluator ? (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {evaluator.fullName.split(" ")[1]?.[0] ?? "؟"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-sm">
                        <div className="font-medium">{evaluator.fullName}</div>
                        <div className="text-xs text-muted-foreground">
                          {evaluator.department}
                        </div>
                      </div>
                      {typeof s.evaluatorScore === "number" && (
                        <Badge
                          variant="outline"
                          className="bg-success/10 text-success border-success/30"
                        >
                          <CheckCircle2 className="me-1 h-3 w-3" />
                          {s.evaluatorScore}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      لم يتم الإسناد بعد
                    </div>
                  )}
                </div>

                {s.notes && (
                  <div className="rounded-md border-s-2 border-warning/60 bg-warning/5 p-2 text-xs text-muted-foreground">
                    <span className="font-semibold">ملاحظة:</span> {s.notes}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-primary"
                    onClick={() => openStatusDialog(s)}
                  >
                    <ClipboardCheck className="me-2 h-4 w-4" />
                    تغيير الحالة
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => openAssignDialog(s)}
                  >
                    <UserPlus className="me-2 h-4 w-4" />
                    {evaluator ? "إعادة الإسناد" : "إسناد لمُقيِّم"}
                  </Button>
                  <Button size="sm" variant="ghost" className="w-full">
                    <FileText className="me-2 h-4 w-4" />
                    عرض الملف
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Status change dialog */}
      <Dialog
        open={statusDialog.open}
        onOpenChange={(open) =>
          setStatusDialog((s) => ({ ...s, open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تغيير حالة البحث</DialogTitle>
            <DialogDescription className="line-clamp-2">
              {statusDialog.submission?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>الحالة الجديدة</Label>
              <Select
                value={
                  statusDialog.nextStatus
                    ? String(statusDialog.nextStatus)
                    : ""
                }
                onValueChange={(v) =>
                  setStatusDialog((s) => ({
                    ...s,
                    nextStatus: Number(v) as SubmissionStatus,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((st) => (
                    <SelectItem key={st} value={String(st)}>
                      {SUBMISSION_STATUS_LABELS[st]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>ملاحظات اللجنة (اختياري)</Label>
              <Textarea
                placeholder="سبب تغيير الحالة، طلب تعديل، أو ملاحظة للموظف..."
                value={statusDialog.note}
                onChange={(e) =>
                  setStatusDialog((s) => ({ ...s, note: e.target.value }))
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setStatusDialog({
                  open: false,
                  submission: null,
                  nextStatus: null,
                  note: "",
                })
              }
            >
              إلغاء
            </Button>
            <Button
              className="bg-gradient-primary"
              onClick={confirmStatusChange}
            >
              حفظ التغيير
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign dialog */}
      <Dialog
        open={assignDialog.open}
        onOpenChange={(open) => setAssignDialog((s) => ({ ...s, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إسناد البحث إلى مُقيِّم</DialogTitle>
            <DialogDescription className="line-clamp-2">
              {assignDialog.submission?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>المُقيِّم</Label>
              <Select
                value={assignDialog.evaluatorId}
                onValueChange={(v) =>
                  setAssignDialog((s) => ({ ...s, evaluatorId: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر مُقيِّماً" />
                </SelectTrigger>
                <SelectContent>
                  {evaluators.map((ev) => (
                    <SelectItem key={ev.id} value={ev.id}>
                      {ev.fullName} — {ev.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الموعد النهائي للتقييم</Label>
              <Input
                type="date"
                value={assignDialog.deadline}
                onChange={(e) =>
                  setAssignDialog((s) => ({ ...s, deadline: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>تعليمات للمُقيِّم (اختياري)</Label>
              <Textarea
                placeholder="نقاط التركيز، معايير خاصة، أو ملاحظات..."
                value={assignDialog.instructions}
                onChange={(e) =>
                  setAssignDialog((s) => ({
                    ...s,
                    instructions: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setAssignDialog({
                  open: false,
                  submission: null,
                  evaluatorId: "",
                  deadline: "",
                  instructions: "",
                })
              }
            >
              إلغاء
            </Button>
            <Button className="bg-gradient-primary" onClick={confirmAssign}>
              <UserPlus className="me-2 h-4 w-4" />
              تأكيد الإسناد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

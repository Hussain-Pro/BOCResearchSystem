import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Upload, FileText, Send } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUBMISSION_TYPE_LABELS } from "@/lib/mockData";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/submit")({
  component: SubmitPage,
});

function SubmitPage() {
  const navigate = useNavigate();
  const [type, setType] = useState("1");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !file) {
      toast.error("الرجاء إكمال جميع الحقول المطلوبة");
      return;
    }
    toast.success("تم تقديم البحث بنجاح. سيتم إشعارك عند المراجعة.");
    navigate({ to: "/my-submissions" });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="تقديم بحث جديد" description="عبئ النموذج لتقديم بحثك إلى لجنة المراجعة" />

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                بيانات التقديم
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>نوع التقديم *</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(SUBMISSION_TYPE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>عنوان البحث *</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="أدخل العنوان الكامل للبحث" />
              </div>

              {(type === "3" || type === "4") && (
                <>
                  <div className="space-y-2">
                    <Label>{type === "4" ? "رابط النشر" : "رقم كتاب الموافقة"}</Label>
                    <Input placeholder={type === "4" ? "https://journal.com/..." : "ك/2025/..."} />
                  </div>
                  <div className="space-y-2">
                    <Label>{type === "4" ? "تاريخ النشر" : "تاريخ الموافقة"}</Label>
                    <Input type="date" />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>ملاحظات (اختياري)</Label>
                <Textarea rows={4} placeholder="أي ملاحظات إضافية..." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                ملفات البحث
              </CardTitle>
            </CardHeader>
            <CardContent>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-muted/30 p-10 text-center transition-colors hover:border-primary hover:bg-accent/30">
                <Upload className="h-10 w-10 text-muted-foreground" />
                <div>
                  <p className="font-medium">اسحب الملف هنا أو اضغط للرفع</p>
                  <p className="mt-1 text-xs text-muted-foreground">PDF فقط — الحد الأقصى 20MB</p>
                </div>
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
              {file && (
                <div className="mt-3 flex items-center justify-between rounded-lg border bg-card p-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{file.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="text-base">شروط التقديم</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• يجب أن تكون مؤهلاً ضمن مدة التغيير الحالية.</p>
              <p>• البحث المنشور يجب أن يقع تاريخه ضمن المدة.</p>
              <p>• لم يُستخدم نفس البحث في ترقية سابقة.</p>
              <p>• ملف PDF فقط بحد أقصى 20MB.</p>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full bg-gradient-primary shadow-glow">
            <Send className="me-2 h-4 w-4" />
            تقديم البحث
          </Button>
          <Button type="button" variant="outline" size="lg" className="w-full" onClick={() => navigate({ to: "/my-submissions" })}>
            إلغاء
          </Button>
        </div>
      </form>
    </div>
  );
}

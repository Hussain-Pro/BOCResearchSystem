import { createFileRoute } from "@tanstack/react-router";
import { Save } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="إعدادات النظام" description="ضبط القيم الأساسية لاحتساب مدد الترقية والتقييم" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>قواعد احتساب الترقية</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>سنوات تغيير العنوان الوظيفي</Label>
              <Input type="number" defaultValue={5} />
            </div>
            <div className="space-y-2">
              <Label>الحد الأدنى لدرجة النجاح</Label>
              <Input type="number" defaultValue={70} />
            </div>
            <div className="space-y-2">
              <Label>مدة الحظر بسبب الانتحال (شهر)</Label>
              <Input type="number" defaultValue={3} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>أوزان التقييم</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>وزن درجة المُقيِّم (%)</Label>
              <Input type="number" defaultValue={70} />
            </div>
            <div className="space-y-2">
              <Label>الحد الأقصى لدرجة اللجنة</Label>
              <Input type="number" defaultValue={30} />
            </div>
            <div className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
              <strong>الصيغة:</strong> الدرجة النهائية = (درجة المُقيِّم × 0.7) + درجة اللجنة
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>خصومات كتب الشكر</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>كتاب من مدير عام / وزير (شهر)</Label>
              <Input type="number" defaultValue={1} />
            </div>
            <div className="space-y-2">
              <Label>كتاب من رئيس الوزراء (شهر)</Label>
              <Input type="number" defaultValue={6} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>خصومات الشهادات</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>دبلوم عالٍ (شهر)</Label>
              <Input type="number" defaultValue={6} />
            </div>
            <div className="space-y-2">
              <Label>ماجستير / دكتوراه (شهر)</Label>
              <Input type="number" defaultValue={12} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button size="lg" className="bg-gradient-primary shadow-glow"><Save className="me-2 h-4 w-4" />حفظ الإعدادات</Button>
      </div>
    </div>
  );
}

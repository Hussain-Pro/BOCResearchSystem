import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  User as UserIcon, Mail, Phone, Building2, Award, Calendar, Shield,
  Smartphone, Copy, Download, KeyRound, Monitor, Save, AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/mockData";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
});

const MOCK_SECRET = "JBSWY3DPEHPK3PXP";
const generateBackupCodes = () =>
  Array.from({ length: 8 }, () =>
    Array.from({ length: 4 }, () =>
      Math.random().toString(36).slice(2, 6).toUpperCase()
    ).join("-")
  );

const mockSessions = [
  { device: "Chrome على Windows", ip: "10.0.12.45", time: "الآن — البصرة", current: true },
  { device: "Safari على iPhone", ip: "10.0.14.22", time: "قبل 3 ساعات — البصرة", current: false },
  { device: "Edge على Windows", ip: "10.0.11.18", time: "أمس 14:30 — بغداد", current: false },
];

function ProfilePage() {
  const { user, updateProfile, enable2FA, disable2FA } = useAuth();
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");

  // 2FA flow
  const [enableOpen, setEnableOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [otp, setOtp] = useState("");
  const [disableOtp, setDisableOtp] = useState("");
  const [disablePw, setDisablePw] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  if (!user) return null;

  const otpauth = `otpauth://totp/ERS:${user.email}?secret=${MOCK_SECRET}&issuer=BasrahOilCo`;

  const saveProfile = () => {
    updateProfile({ email, phone });
    toast.success("تم حفظ التغييرات");
  };

  const changePassword = () => {
    if (!pwCurrent || !pwNew || !pwConfirm) return toast.error("يرجى ملء جميع الحقول");
    if (pwNew.length < 8) return toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
    if (pwNew !== pwConfirm) return toast.error("كلمتا المرور غير متطابقتين");
    setPwCurrent(""); setPwNew(""); setPwConfirm("");
    toast.success("تم تغيير كلمة المرور بنجاح");
  };

  const copySecret = async () => {
    await navigator.clipboard.writeText(MOCK_SECRET);
    toast.success("تم نسخ المفتاح السري");
  };

  const downloadCodes = () => {
    const blob = new Blob([
      `رموز الاسترداد - نظام البحوث الإلكتروني\nالمستخدم: ${user.fullName}\nالتاريخ: ${new Date().toLocaleString("ar-IQ")}\n\n${backupCodes.join("\n")}\n\nاحتفظ بهذه الرموز في مكان آمن.`,
    ], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "ers-backup-codes.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  const handle2FAToggle = (next: boolean) => {
    if (next) {
      setStep(1); setOtp(""); setBackupCodes(generateBackupCodes());
      setEnableOpen(true);
    } else {
      setDisableOtp(""); setDisablePw("");
      setDisableOpen(true);
    }
  };

  const verifyAndEnable = () => {
    if (otp.length !== 6) return toast.error("أدخل الرمز المكوّن من 6 أرقام");
    const ok = enable2FA(otp);
    if (!ok) return toast.error("الرمز غير صحيح");
    setStep(3);
  };

  const finishEnable = () => {
    setEnableOpen(false);
    toast.success("تم تفعيل التحقق بخطوتين بنجاح");
  };

  const confirmDisable = () => {
    if (!disablePw) return toast.error("أدخل كلمة المرور الحالية");
    if (disableOtp.length !== 6) return toast.error("أدخل رمز التحقق");
    disable2FA();
    setDisableOpen(false);
    toast.success("تم إيقاف التحقق بخطوتين");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="الملف الشخصي"
        description="إدارة بياناتك الشخصية، الأمان، والتفضيلات"
      />

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:grid-cols-4">
          <TabsTrigger value="info">المعلومات الشخصية</TabsTrigger>
          <TabsTrigger value="security">الأمان</TabsTrigger>
          <TabsTrigger value="2fa">التحقق بخطوتين</TabsTrigger>
          <TabsTrigger value="prefs">التفضيلات</TabsTrigger>
        </TabsList>

        {/* === Info === */}
        <TabsContent value="info" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>المعلومات الأساسية</CardTitle>
              <CardDescription>البيانات الوظيفية مُدارة من قِبل الموارد البشرية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 ring-4 ring-primary/20">
                  <AvatarFallback className="bg-gradient-primary text-2xl text-primary-foreground">
                    {user.fullName.split(" ")[1]?.[0] ?? user.fullName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="text-xl font-bold">{user.fullName}</div>
                  <div className="text-sm text-muted-foreground">{user.jobTitle}</div>
                  <Badge variant="secondary" className="mt-2">{ROLE_LABELS[user.role]}</Badge>
                </div>
                <Button variant="outline" size="sm">تغيير الصورة</Button>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <ReadField icon={UserIcon} label="الرقم الوظيفي" value={user.id.toUpperCase()} />
                <ReadField icon={Building2} label="القسم" value={user.department} />
                <ReadField icon={Award} label="الشهادة" value={user.qualification} />
                <ReadField icon={Calendar} label="آخر تغيير للدرجة" value={user.lastGradeChangeDate} />
                <ReadField icon={Shield} label="الدرجة الوظيفية" value={`الدرجة ${user.jobGrade}`} />
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pr-10" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XX XXX XXXX" className="pr-10" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveProfile} className="gap-2">
                  <Save className="h-4 w-4" /> حفظ التغييرات
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === Security === */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تغيير كلمة المرور</CardTitle>
              <CardDescription>استخدم كلمة مرور قوية لا تقل عن 8 أحرف</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="pw1">كلمة المرور الحالية</Label>
                  <Input id="pw1" type="password" value={pwCurrent} onChange={(e) => setPwCurrent(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pw2">كلمة المرور الجديدة</Label>
                  <Input id="pw2" type="password" value={pwNew} onChange={(e) => setPwNew(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pw3">تأكيد كلمة المرور</Label>
                  <Input id="pw3" type="password" value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={changePassword} className="gap-2"><KeyRound className="h-4 w-4" /> تحديث كلمة المرور</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الجلسات النشطة</CardTitle>
              <CardDescription>الأجهزة المسجّل دخولها على حسابك حالياً</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockSessions.map((s, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Monitor className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        {s.device}
                        {s.current && <Badge variant="secondary" className="text-[10px]">الحالية</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground">IP: {s.ip} • {s.time}</div>
                    </div>
                  </div>
                  {!s.current && <Button variant="ghost" size="sm">إنهاء</Button>}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* === 2FA === */}
        <TabsContent value="2fa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" /> التحقق بخطوتين (2FA)
              </CardTitle>
              <CardDescription>
                طبقة حماية إضافية تتطلب رمزاً مؤقتاً من تطبيق المصادقة عند كل دخول.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${user.twoFactorEnabled ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-semibold">
                      {user.twoFactorEnabled ? "التحقق بخطوتين مفعّل" : "التحقق بخطوتين غير مفعّل"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {user.twoFactorEnabled ? "حسابك محمي بطبقة أمان إضافية" : "نوصي بشدة بتفعيل هذه الميزة"}
                    </div>
                  </div>
                </div>
                <Switch checked={!!user.twoFactorEnabled} onCheckedChange={handle2FAToggle} />
              </div>

              {!user.twoFactorEnabled && (
                <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-warning" />
                  <p className="text-muted-foreground">
                    حماية حسابك بكلمة المرور وحدها قد لا تكون كافية. فعّل التحقق بخطوتين باستخدام تطبيق مثل
                    <strong className="mx-1">Google Authenticator</strong> أو
                    <strong className="mx-1">Microsoft Authenticator</strong>.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* === Preferences === */}
        <TabsContent value="prefs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>التفضيلات</CardTitle>
              <CardDescription>تخصيص تجربتك داخل النظام</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PrefRow label="اللغة" hint="العربية (افتراضي)" disabled />
              <PrefRow label="إشعارات البريد الإلكتروني" hint="تنبيهات عن حالة بحوثك" defaultOn />
              <PrefRow label="إشعارات داخل النظام" hint="تنبيهات فورية في شريط الإشعارات" defaultOn />
              <PrefRow label="الوضع الليلي" hint="استخدام الثيم الداكن" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* === Enable 2FA Dialog === */}
      <Dialog open={enableOpen} onOpenChange={setEnableOpen}>
        <DialogContent dir="rtl" className="max-w-lg">
          <DialogHeader>
            <DialogTitle>تفعيل التحقق بخطوتين</DialogTitle>
            <DialogDescription>
              {step === 1 && "الخطوة 1 من 3 — امسح رمز QR بتطبيق المصادقة"}
              {step === 2 && "الخطوة 2 من 3 — أدخل الرمز المكوّن من 6 أرقام"}
              {step === 3 && "الخطوة 3 من 3 — احفظ رموز الاسترداد"}
            </DialogDescription>
          </DialogHeader>

          {step === 1 && (
            <div className="space-y-4">
              <div className="flex justify-center rounded-xl border bg-white p-6">
                <QRCodeSVG value={otpauth} size={180} level="M" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">أو أدخل المفتاح يدوياً:</Label>
                <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-2">
                  <code className="flex-1 font-mono text-sm tracking-wider">{MOCK_SECRET}</code>
                  <Button size="icon" variant="ghost" onClick={copySecret}><Copy className="h-4 w-4" /></Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                استخدم Google Authenticator أو Microsoft Authenticator أو أي تطبيق TOTP متوافق.
              </p>
              <DialogFooter>
                <Button onClick={() => setStep(2)} className="w-full">التالي</Button>
              </DialogFooter>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                افتح تطبيق المصادقة وأدخل الرمز المعروض حالياً للتحقق من الإعداد.
              </p>
              <div className="flex justify-center" dir="ltr">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>السابق</Button>
                <Button onClick={verifyAndEnable} className="flex-1">تحقّق وفعّل</Button>
              </DialogFooter>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-warning/40 bg-warning/5 p-3 text-sm text-muted-foreground">
                ⚠️ احفظ هذه الرموز في مكان آمن. كل رمز يُستخدم مرة واحدة لاسترداد حسابك إذا فقدت جهازك.
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/40 p-4 font-mono text-sm">
                {backupCodes.map((c) => <div key={c} className="text-center">{c}</div>)}
              </div>
              <Button variant="outline" className="w-full gap-2" onClick={downloadCodes}>
                <Download className="h-4 w-4" /> تنزيل الرموز كملف نصي
              </Button>
              <DialogFooter>
                <Button onClick={finishEnable} className="w-full">تم — إنهاء الإعداد</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* === Disable 2FA Dialog === */}
      <Dialog open={disableOpen} onOpenChange={setDisableOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>إيقاف التحقق بخطوتين</DialogTitle>
            <DialogDescription>
              للتأكيد، أدخل كلمة المرور الحالية والرمز من تطبيق المصادقة.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>كلمة المرور</Label>
              <Input type="password" value={disablePw} onChange={(e) => setDisablePw(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>رمز التحقق (6 أرقام)</Label>
              <div className="flex justify-center" dir="ltr">
                <InputOTP maxLength={6} value={disableOtp} onChange={setDisableOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDisableOpen(false)}>إلغاء</Button>
            <Button variant="destructive" onClick={confirmDisable}>تأكيد الإيقاف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReadField({ icon: Icon, label, value }: { icon: typeof UserIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-muted/20 p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="truncate text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}

function PrefRow({ label, hint, disabled, defaultOn }: { label: string; hint: string; disabled?: boolean; defaultOn?: boolean }) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div>
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs text-muted-foreground">{hint}</div>
      </div>
      <Switch checked={on} onCheckedChange={setOn} disabled={disabled} />
    </div>
  );
}

import { createFileRoute, useNavigate, Navigate, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { z } from "zod";
import {
  GraduationCap, Lock, User, Mail, IdCard, KeyRound, Building2, Briefcase, Award,
  ArrowRight, Search, CheckCircle2, RefreshCw, Upload, FileImage, X, Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockQualifications } from "@/lib/mockData";
import { generateUsername } from "@/lib/transliterate";
import { toast } from "sonner";
import { api } from "@/lib/api";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

const schema = z.object({
  staffNo: z.string().trim().min(3, "الرقم الوظيفي مطلوب").max(20),
  fullName: z.string().trim().min(3, "الاسم الكامل مطلوب").max(100),
  email: z.string().trim().email("بريد إلكتروني غير صالح").refine(
    (v) => v.endsWith("@boc.oil.gov.iq") || v.endsWith("@boc.iq"),
    "يجب استخدام البريد المؤسسي (@boc.oil.gov.iq)"
  ),
  username: z.string().trim().regex(/^[a-z0-9._-]{3,30}$/, "اسم المستخدم بالإنجليزية فقط (3-30)"),
  password: z.string().min(8, "كلمة المرور 8 أحرف على الأقل").regex(/[A-Z]/, "حرف كبير واحد على الأقل").regex(/[a-z]/, "حرف صغير واحد على الأقل").regex(/\d/, "رقم واحد على الأقل"),
  confirmPassword: z.string(),
  activationCode: z.string().trim().min(4, "رمز التفعيل مطلوب"),
  department: z.string().min(1, "القسم مطلوب"),
  division: z.string().min(1, "الشعبة مطلوبة"),
  jobTitle: z.string().trim().min(2, "المسمى الوظيفي مطلوب"),
  jobGrade: z.enum(["2", "3"]),
  qualification: z.string().min(1, "الشهادة مطلوبة"),
  idCardFile: z.string().min(1, "صورة الهوية الوظيفية مطلوبة"),
  agree: z.literal(true, { message: "يجب الموافقة على الشروط" }),
}).refine((d) => d.password === d.confirmPassword, {
  path: ["confirmPassword"],
  message: "كلمتا المرور غير متطابقتين",
});

type VerifiedLookup = {
  employeeId: string;
  fullName: string;
  department: string;
  section: string;
  jobTitle: string;
  jobGrade: number;
  qualification: number;
  qualificationName: string;
};

type FormState = {
  staffNo: string; fullName: string; email: string; username: string;
  password: string; confirmPassword: string; activationCode: string;
  department: string; division: string; jobTitle: string;
  jobGrade: "2" | "3"; qualification: string;
  idCardFile: string; idCardName: string; agree: boolean;
};

async function uploadBadgeDataUrl(dataUrl: string, filename: string): Promise<string> {
  const blob = await (await fetch(dataUrl)).blob();
  const fd = new FormData();
  fd.append("file", blob, filename || "badge.jpg");
  const uploadRes = await api.post("/upload/badge", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  const path = uploadRes.data?.data;
  if (typeof path !== "string" || !path) throw new Error("bad_upload");
  return path;
}

const INITIAL: FormState = {
  staffNo: "", fullName: "", email: "", username: "",
  password: "", confirmPassword: "", activationCode: "",
  department: "", division: "", jobTitle: "",
  jobGrade: "3", qualification: "",
  idCardFile: "", idCardName: "", agree: false,
};

function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState<VerifiedLookup | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/dashboard" />;

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k as string]: "" }));
  };

  // ===== Step 1: verify staff number against master =====
  const verifyStaffNo = async () => {
    if (!form.staffNo.trim()) {
      toast.error("أدخل الرقم الوظيفي أولاً");
      return;
    }
    setVerifying(true);
    try {
      const res = await api.get(`/employees/lookup/${encodeURIComponent(form.staffNo.trim())}`);
      const d = res.data?.data;
      if (!d) {
        setVerified(null);
        toast.error("الرقم الوظيفي غير موجود في قاعدة بيانات الموارد البشرية");
        return;
      }
      const lookup: VerifiedLookup = {
        employeeId: d.employeeId,
        fullName: d.fullName,
        department: d.department,
        section: d.section,
        jobTitle: d.jobTitle,
        jobGrade: d.jobGrade,
        qualification: d.qualification,
        qualificationName: d.qualificationName,
      };
      setVerified(lookup);
      const suggestedUsername = generateUsername(d.fullName, new Set<string>());
      const suggestedEmail = `${suggestedUsername}@boc.oil.gov.iq`;
      setForm((f) => ({
        ...f,
        fullName: d.fullName,
        department: d.department,
        division: d.section,
        jobTitle: d.jobTitle,
        jobGrade: d.jobGrade === 2 ? "2" : "3",
        username: suggestedUsername,
        email: f.email || suggestedEmail,
      }));
      setErrors({});
      toast.success("تم التحقق من بياناتك في الملف الرئيسي");
    } catch (e: unknown) {
      setVerified(null);
      const err = e as { response?: { status?: number; data?: { message?: string } } };
      const msg =
        err.response?.status === 409
          ? err.response?.data?.message || "يوجد حساب مرتبط بهذا الرقم"
          : err.response?.data?.message || "الرقم الوظيفي غير موجود في قاعدة بيانات الموارد البشرية";
      toast.error(msg);
    } finally {
      setVerifying(false);
    }
  };

  // ===== Username regenerate =====
  const regenerateUsername = () => {
    if (!form.fullName.trim()) {
      toast.error("الاسم الكامل مطلوب لإنشاء اسم المستخدم");
      return;
    }
    const taken = new Set<string>();
    if (form.username) taken.add(form.username);
    const next = generateUsername(form.fullName, taken);
    set("username", next);
    toast.success(`تم اقتراح: ${next}`);
  };

  // ===== ID card upload =====
  const onPickFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast.error("نوع الملف غير مدعوم. استخدم صورة أو PDF");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("الحجم الأقصى 5 ميغابايت");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({
        ...f,
        idCardFile: typeof reader.result === "string" ? reader.result : "",
        idCardName: file.name,
      }));
      setErrors((e) => ({ ...e, idCardFile: "" }));
    };
    reader.readAsDataURL(file);
  };

  const clearFile = () => {
    setForm((f) => ({ ...f, idCardFile: "", idCardName: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ===== Submit =====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verified) {
      toast.error("يجب التحقق من الرقم الوظيفي أولاً");
      setErrors((er) => ({ ...er, staffNo: "اضغط 'تحقق' للتأكد من بياناتك" }));
      return;
    }
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        errs[i.path[0] as string] = i.message;
      });
      setErrors(errs);
      toast.error("يرجى تصحيح الأخطاء في النموذج");
      return;
    }
    setSubmitting(true);
    try {
      let badgePath: string | null = null;
      if (form.idCardFile.startsWith("data:")) {
        badgePath = await uploadBadgeDataUrl(form.idCardFile, form.idCardName || "badge.jpg");
      }
      const res = await register({
        employeeId: verified.employeeId,
        fullName: form.fullName,
        email: form.email,
        username: form.username,
        password: form.password,
        activationCode: form.activationCode,
        badgeImagePath: badgePath,
      });
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success("تم إرسال طلب التسجيل، بانتظار تفعيل المشرف");
      navigate({ to: "/" });
    } catch {
      toast.error("فشل رفع صورة الهوية أو إرسال الطلب");
    } finally {
      setSubmitting(false);
    }
  };

  // Inline simple field renderer (kept as a normal component to avoid focus loss).
  return (
    <div dir="rtl" className="grid min-h-screen lg:grid-cols-[1fr_1.2fr]">
      {/* Hero */}
      <div className="relative hidden overflow-hidden bg-gradient-hero lg:block">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="text-lg font-bold">شركة نفط البصرة</div>
              <div className="text-sm text-white/70">Basrah Oil Company</div>
            </div>
          </div>
          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight">
              انضم إلى<br />
              <span className="text-primary-glow">منصة البحوث</span>
            </h1>
            <p className="max-w-md text-lg text-white/80 leading-relaxed">
              أدخل رقمك الوظيفي ليتم جلب بياناتك تلقائياً من ملف الموارد البشرية، ثم ارفع صورة هويتك للتحقق.
            </p>
            <div className="space-y-2 rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur text-sm">
              <p>💡 بعد تشغيل الخادم، استدعِ <code className="rounded bg-white/20 px-2 py-0.5 font-mono">GET /api/auth/seed</code> لإنشاء الأدوار والموظفين التجريبيين.</p>
              <p>🔢 أرقام وظيفية للتجربة: <code className="rounded bg-white/20 px-2 py-0.5 font-mono">10245</code> · <code className="rounded bg-white/20 px-2 py-0.5 font-mono">10312</code> · <code className="rounded bg-white/20 px-2 py-0.5 font-mono">10488</code></p>
            </div>
          </div>
          <p className="text-xs text-white/50">© 2026 شركة نفط البصرة. جميع الحقوق محفوظة.</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-2xl space-y-6">
          <div>
            <h2 className="text-3xl font-bold">إنشاء حساب موظف</h2>
            <p className="mt-2 text-muted-foreground">تحقق من رقمك الوظيفي ليتم جلب بياناتك تلقائياً</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* === Step 1: staff number lookup === */}
            <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
              <Label htmlFor="staffNo" className="flex items-center gap-2 text-sm font-semibold">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] text-primary-foreground">1</span>
                الرقم الوظيفي (Staff No.)
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <IdCard className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="staffNo"
                    value={form.staffNo}
                    onChange={(e) => { set("staffNo", e.target.value); setVerified(null); }}
                    placeholder="مثلاً: 10245"
                    className="pr-10"
                    disabled={verifying}
                  />
                </div>
                <Button type="button" onClick={verifyStaffNo} disabled={verifying} className="gap-2 shrink-0">
                  {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  {verifying ? "جارٍ التحقق..." : "تحقق"}
                </Button>
              </div>
              {errors.staffNo && <p className="text-xs text-destructive">{errors.staffNo}</p>}

              {verified && (
                <div className="flex items-start gap-2 rounded-lg border border-success/40 bg-success/5 p-3 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-success shrink-0" />
                  <div className="space-y-0.5">
                    <p className="font-semibold text-success">تم التحقق بنجاح</p>
                    <p className="text-muted-foreground text-xs">
                      {verified.fullName} — {verified.department} / {verified.section}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* === Step 2: filled-in data (locked when from master) === */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="fullName">الاسم الكامل</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="fullName"
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    placeholder="يُعبَّأ تلقائياً بعد التحقق"
                    className="pr-10 disabled:opacity-100 disabled:bg-muted/40"
                    disabled={!!verified}
                  />
                </div>
                {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>القسم (Department)</Label>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={form.department} disabled className="pr-10 disabled:opacity-100 disabled:bg-muted/40" placeholder="—" />
                </div>
                {errors.department && <p className="text-xs text-destructive">{errors.department}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>الشعبة (Division)</Label>
                <Input value={form.division} disabled className="disabled:opacity-100 disabled:bg-muted/40" placeholder="—" />
                {errors.division && <p className="text-xs text-destructive">{errors.division}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>المسمى الوظيفي</Label>
                <div className="relative">
                  <Briefcase className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={form.jobTitle} disabled className="pr-10 disabled:opacity-100 disabled:bg-muted/40" placeholder="—" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>الدرجة الوظيفية</Label>
                <Input value={form.jobGrade ? `الدرجة ${form.jobGrade === "2" ? "الثانية" : "الثالثة"}` : ""} disabled className="disabled:opacity-100 disabled:bg-muted/40" placeholder="—" />
              </div>

              {/* Qualification — user-supplied */}
              <div className="space-y-1.5">
                <Label>الشهادة</Label>
                <Select value={form.qualification} onValueChange={(v) => set("qualification", v)} disabled={!verified}>
                  <SelectTrigger><Award className="ms-1 h-4 w-4 text-muted-foreground" /><SelectValue placeholder="اختر الشهادة" /></SelectTrigger>
                  <SelectContent>{mockQualifications.map((q) => <SelectItem key={q} value={q}>{q}</SelectItem>)}</SelectContent>
                </Select>
                {errors.qualification && <p className="text-xs text-destructive">{errors.qualification}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="email">البريد الإلكتروني المؤسسي</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email" type="email" value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="name@boc.oil.gov.iq" className="pr-10"
                    disabled={!verified}
                  />
                </div>
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              {/* Username with regenerate */}
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="username" className="flex items-center justify-between">
                  <span>اسم المستخدم (إنجليزي)</span>
                  <button
                    type="button"
                    onClick={regenerateUsername}
                    disabled={!verified}
                    className="inline-flex items-center gap-1 text-xs font-normal text-primary hover:underline disabled:opacity-50"
                  >
                    <RefreshCw className="h-3 w-3" /> اقتراح آخر
                  </button>
                </Label>
                <div className="relative">
                  <User className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="username" value={form.username}
                    onChange={(e) => set("username", e.target.value.toLowerCase())}
                    placeholder="firstname.lastname"
                    className="pr-10 font-mono"
                    disabled={!verified}
                    dir="ltr"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">يُولَّد تلقائياً من اسمك. يمكنك تعديله ضمن الحروف الإنجليزية.</p>
                {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="password" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="••••••••" className="pr-10" disabled={!verified} />
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="confirmPassword" type="password" value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} placeholder="••••••••" className="pr-10" disabled={!verified} />
                </div>
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
              </div>

              {/* Activation code */}
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="activationCode">رمز التفعيل</Label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="activationCode" value={form.activationCode} onChange={(e) => set("activationCode", e.target.value)} placeholder="ERS-XXXX" className="pr-10" disabled={!verified} />
                </div>
                {errors.activationCode && <p className="text-xs text-destructive">{errors.activationCode}</p>}
              </div>
            </div>

            {/* === Step 3: BOC ID card upload === */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] text-primary-foreground">3</span>
                صورة الهوية الوظيفية (BOC ID Card)
              </Label>

              {!form.idCardFile ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!verified}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-input bg-muted/20 p-6 text-center transition-colors hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div className="text-sm font-semibold">اضغط لرفع صورة الهوية</div>
                  <div className="text-xs text-muted-foreground">JPG / PNG / PDF — حتى 5 ميغابايت</div>
                </button>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
                  {form.idCardFile.startsWith("data:image") ? (
                    <img src={form.idCardFile} alt="ID preview" className="h-16 w-16 rounded-lg border object-cover" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg border bg-muted">
                      <FileImage className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{form.idCardName}</div>
                    <div className="text-xs text-success">✓ تم الرفع</div>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={clearFile}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => onPickFile(e.target.files?.[0])}
              />
              {errors.idCardFile && <p className="text-xs text-destructive">{errors.idCardFile}</p>}
            </div>

            {/* Agreement */}
            <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3">
              <Checkbox id="agree" checked={form.agree} onCheckedChange={(v) => set("agree", Boolean(v))} className="mt-0.5" />
              <Label htmlFor="agree" className="text-sm font-normal leading-relaxed cursor-pointer">
                أوافق على شروط الاستخدام وسياسة الخصوصية الخاصة بشركة نفط البصرة، وأقرّ بصحة البيانات والمستندات المُرفقة.
              </Label>
            </div>
            {errors.agree && <p className="text-xs text-destructive">{errors.agree}</p>}

            <Button type="submit" className="w-full bg-gradient-primary shadow-glow hover:opacity-90" size="lg" disabled={!verified || submitting}>
              {submitting ? "جارٍ الإرسال..." : "إرسال طلب التسجيل"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              لديك حساب بالفعل؟{" "}
              <Link to="/" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
                تسجيل الدخول
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

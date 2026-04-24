import { createFileRoute, useNavigate, Navigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { GraduationCap, Lock, User, Mail, IdCard, KeyRound, Building2, Briefcase, Award, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockDepartments, mockQualifications } from "@/lib/mockData";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

const schema = z.object({
  employeeId: z.string().trim().min(3, "الرقم الوظيفي مطلوب").max(20),
  fullName: z.string().trim().min(3, "الاسم الكامل مطلوب").max(100),
  email: z.string().trim().email("بريد إلكتروني غير صالح").refine(
    (v) => v.endsWith("@boc.oil.gov.iq") || v.endsWith("@boc.iq"),
    "يجب استخدام البريد المؤسسي (@boc.oil.gov.iq)"
  ),
  username: z.string().trim().min(3, "اسم المستخدم قصير").max(30),
  password: z.string().min(8, "كلمة المرور 8 أحرف على الأقل").regex(/[A-Z]/, "حرف كبير واحد على الأقل").regex(/[a-z]/, "حرف صغير واحد على الأقل").regex(/\d/, "رقم واحد على الأقل"),
  confirmPassword: z.string(),
  activationCode: z.string().trim().min(4, "رمز التفعيل مطلوب"),
  department: z.string().min(1, "القسم مطلوب"),
  jobTitle: z.string().trim().min(2, "المسمى الوظيفي مطلوب"),
  jobGrade: z.enum(["2", "3"]),
  qualification: z.string().min(1, "الشهادة مطلوبة"),
  agree: z.literal(true, { message: "يجب الموافقة على الشروط" }),
}).refine((d) => d.password === d.confirmPassword, {
  path: ["confirmPassword"],
  message: "كلمتا المرور غير متطابقتين",
});

type FormState = {
  employeeId: string; fullName: string; email: string; username: string;
  password: string; confirmPassword: string; activationCode: string;
  department: string; jobTitle: string; jobGrade: "2" | "3"; qualification: string; agree: boolean;
};

function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    employeeId: "", fullName: "", email: "", username: "",
    password: "", confirmPassword: "", activationCode: "",
    department: "", jobTitle: "", jobGrade: "3", qualification: "", agree: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (user) return <Navigate to="/dashboard" />;

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k as string]: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    const res = register({
      employeeId: form.employeeId,
      fullName: form.fullName,
      email: form.email,
      username: form.username,
      password: form.password,
      activationCode: form.activationCode,
      department: form.department,
      jobTitle: form.jobTitle,
      jobGrade: Number(form.jobGrade) as 2 | 3,
      qualification: form.qualification,
    });
    if (!res.ok) {
      toast.error(res.message);
      return;
    }
    toast.success("تم إرسال طلب التسجيل، بانتظار تفعيل المشرف");
    navigate({ to: "/" });
  };

  const Field = ({ id, label, icon: Icon, type = "text", placeholder }: { id: keyof FormState; label: string; icon: typeof User; type?: string; placeholder?: string }) => (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type={type}
          value={form[id] as string}
          onChange={(e) => set(id, e.target.value as FormState[typeof id])}
          placeholder={placeholder}
          className="pr-10"
        />
      </div>
      {errors[id as string] && <p className="text-xs text-destructive">{errors[id as string]}</p>}
    </div>
  );

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
              قدّم بحوثك وتقاريرك الفنية، تابع تقييماتك، واحصل على ترقيتك الوظيفية بسلاسة كاملة.
            </p>
            <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur">
              <p className="text-sm text-white/90">
                💡 رمز التفعيل التجريبي: <code className="rounded bg-white/20 px-2 py-0.5 font-mono">ERS-2025</code>
              </p>
            </div>
          </div>
          <p className="text-xs text-white/50">© 2025 شركة نفط البصرة. جميع الحقوق محفوظة.</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-2xl space-y-6">
          <div>
            <h2 className="text-3xl font-bold">إنشاء حساب جديد</h2>
            <p className="mt-2 text-muted-foreground">املأ بياناتك لتقديم طلب الانضمام إلى النظام</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field id="employeeId" label="الرقم الوظيفي" icon={IdCard} placeholder="مثلاً: 12345" />
              <Field id="fullName" label="الاسم الكامل" icon={User} placeholder="الاسم الثلاثي" />
              <Field id="email" label="البريد الإلكتروني المؤسسي" icon={Mail} type="email" placeholder="name@boc.oil.gov.iq" />
              <Field id="username" label="اسم المستخدم" icon={User} placeholder="username" />
              <Field id="password" label="كلمة المرور" icon={Lock} type="password" placeholder="••••••••" />
              <Field id="confirmPassword" label="تأكيد كلمة المرور" icon={Lock} type="password" placeholder="••••••••" />

              <div className="space-y-1.5">
                <Label>القسم</Label>
                <Select value={form.department} onValueChange={(v) => set("department", v)}>
                  <SelectTrigger><Building2 className="ms-1 h-4 w-4 text-muted-foreground" /><SelectValue placeholder="اختر القسم" /></SelectTrigger>
                  <SelectContent>{mockDepartments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
                {errors.department && <p className="text-xs text-destructive">{errors.department}</p>}
              </div>

              <Field id="jobTitle" label="المسمى الوظيفي" icon={Briefcase} placeholder="مثلاً: مهندس نفط" />

              <div className="space-y-1.5">
                <Label>الدرجة الوظيفية</Label>
                <Select value={form.jobGrade} onValueChange={(v) => set("jobGrade", v as "2" | "3")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">الدرجة الثالثة</SelectItem>
                    <SelectItem value="2">الدرجة الثانية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>الشهادة</Label>
                <Select value={form.qualification} onValueChange={(v) => set("qualification", v)}>
                  <SelectTrigger><Award className="ms-1 h-4 w-4 text-muted-foreground" /><SelectValue placeholder="اختر الشهادة" /></SelectTrigger>
                  <SelectContent>{mockQualifications.map((q) => <SelectItem key={q} value={q}>{q}</SelectItem>)}</SelectContent>
                </Select>
                {errors.qualification && <p className="text-xs text-destructive">{errors.qualification}</p>}
              </div>

              <div className="md:col-span-2">
                <Field id="activationCode" label="رمز التفعيل" icon={KeyRound} placeholder="ERS-XXXX" />
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3">
              <Checkbox id="agree" checked={form.agree} onCheckedChange={(v) => set("agree", Boolean(v))} className="mt-0.5" />
              <Label htmlFor="agree" className="text-sm font-normal leading-relaxed cursor-pointer">
                أوافق على شروط الاستخدام وسياسة الخصوصية الخاصة بشركة نفط البصرة، وأقرّ بصحة البيانات المُدخلة.
              </Label>
            </div>
            {errors.agree && <p className="text-xs text-destructive">{errors.agree}</p>}

            <Button type="submit" className="w-full bg-gradient-primary shadow-glow hover:opacity-90" size="lg">
              إرسال طلب التسجيل
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

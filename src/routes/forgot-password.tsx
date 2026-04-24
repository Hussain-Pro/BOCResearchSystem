import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { GraduationCap, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("الرجاء إدخال البريد الإلكتروني");
      return;
    }
    if (!email.endsWith("@boc.oil.gov.iq") && !email.endsWith("@boc.iq")) {
      toast.error("يجب استخدام البريد المؤسسي (@boc.oil.gov.iq)");
      return;
    }
    
    // Simulate API request
    setIsSubmitted(true);
    toast.success("تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني");
  };

  return (
    <div dir="rtl" className="grid min-h-screen lg:grid-cols-2">
      {/* Hero side */}
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
            <h1 className="text-5xl font-bold leading-tight">
              استعادة<br />
              <span className="text-primary-glow">كلمة المرور</span>
            </h1>
            <p className="max-w-md text-lg text-white/80 leading-relaxed">
              أدخل بريدك الإلكتروني المؤسسي المسجل لدينا، وسنرسل لك رابطاً مشفراً لتعيين كلمة مرور جديدة لحسابك.
            </p>
          </div>

          <p className="text-xs text-white/50">© 2025 شركة نفط البصرة. جميع الحقوق محفوظة.</p>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="font-bold">نظام البحوث الإلكتروني</div>
              <div className="text-xs text-muted-foreground">شركة نفط البصرة</div>
            </div>
          </div>

          {!isSubmitted ? (
            <>
              <div>
                <h2 className="text-3xl font-bold">نسيت كلمة المرور؟</h2>
                <p className="mt-2 text-muted-foreground">أدخل بريدك الإلكتروني المؤسسي لإرسال رابط الاستعادة</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني المؤسسي</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="name@boc.oil.gov.iq" 
                      className="pr-10 text-left" 
                      dir="ltr"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-gradient-primary shadow-glow hover:opacity-90" size="lg">
                  إرسال رابط الاستعادة
                </Button>

                <div className="text-center">
                  <Link to="/" className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                    <ArrowRight className="h-4 w-4" />
                    العودة إلى تسجيل الدخول
                  </Link>
                </div>
              </form>
            </>
          ) : (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10 text-success">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-success">تم الإرسال بنجاح</h2>
              <p className="text-muted-foreground text-sm">
                تم إرسال رابط استعادة كلمة المرور إلى البريد الإلكتروني:<br/>
                <span className="font-semibold text-foreground mt-2 block" dir="ltr">{email}</span>
              </p>
              <div className="pt-4">
                <Button onClick={() => navigate({ to: "/" })} variant="outline" className="w-full">
                  العودة إلى تسجيل الدخول
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

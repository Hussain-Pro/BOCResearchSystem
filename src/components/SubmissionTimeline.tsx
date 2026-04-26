import { CheckCircle2, Circle, Clock, FileText, ShieldCheck, Users, Award, Send, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SubmissionStatus } from "@/lib/mockData";

interface Step {
  key: string;
  label: string;
  icon: typeof Circle;
  /** Statuses at which this step is considered "reached" */
  reachedAt: SubmissionStatus[];
  /** If reaching one of these, the step is marked failed instead of complete */
  failedAt?: SubmissionStatus[];
}

const STEPS: Step[] = [
  { key: "submit",   label: "تم التقديم",            icon: FileText,    reachedAt: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
  { key: "review",   label: "مراجعة المطابقة",        icon: ShieldCheck, reachedAt: [2, 4, 5, 7, 8, 11], failedAt: [3, 6] },
  { key: "evaluate", label: "تقييم المُقيِّم واللجنة", icon: Users,       reachedAt: [4, 5, 7, 11],     failedAt: [6] },
  { key: "decision", label: "القرار النهائي",          icon: Award,       reachedAt: [4, 11],           failedAt: [5, 6] },
  { key: "ministry", label: "إرسال للوزارة",          icon: Send,        reachedAt: [11] },
];

export function SubmissionTimeline({
  status,
  submittedAt,
  className,
}: {
  status: SubmissionStatus;
  submittedAt?: string;
  className?: string;
}) {
  return (
    <ol className={cn("relative space-y-4", className)}>
      {STEPS.map((step, i) => {
        const failed = step.failedAt?.includes(status) ?? false;
        const reached = step.reachedAt.includes(status);
        const isCurrent =
          (reached || failed) && (STEPS[i + 1] ? !STEPS[i + 1].reachedAt.includes(status) && !(STEPS[i + 1].failedAt?.includes(status)) : true);
        const Icon = failed ? XCircle : reached ? CheckCircle2 : isCurrent ? Clock : step.icon;

        const tone = failed
          ? "bg-destructive/15 text-destructive ring-destructive/30"
          : reached
            ? "bg-success/15 text-success ring-success/30"
            : isCurrent
              ? "bg-primary/15 text-primary ring-primary/30 animate-pulse"
              : "bg-muted text-muted-foreground ring-border";

        return (
          <li key={step.key} className="relative flex gap-3">
            {/* Connector */}
            {i < STEPS.length - 1 && (
              <span
                className={cn(
                  "absolute right-[18px] top-9 h-[calc(100%-12px)] w-px",
                  reached && !failed ? "bg-success/40" : "bg-border",
                )}
                aria-hidden
              />
            )}
            <span
              className={cn(
                "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-2",
                tone,
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex items-center gap-2">
                <span className={cn("text-sm font-semibold", failed && "text-destructive", isCurrent && "text-primary")}>
                  {step.label}
                </span>
                {failed && <span className="text-xs text-destructive">— لم تُجتَز</span>}
                {isCurrent && !failed && <span className="text-xs text-primary">— الخطوة الحالية</span>}
              </div>
              {step.key === "submit" && submittedAt && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  {new Date(submittedAt).toLocaleDateString("ar-IQ")}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

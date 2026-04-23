import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: "primary" | "success" | "warning" | "info";
}

const VARIANTS = {
  primary: "from-primary to-primary-glow",
  success: "from-success to-success/70",
  warning: "from-warning to-warning/70",
  info: "from-info to-info/70",
};

export function StatCard({ title, value, icon: Icon, trend, variant = "primary" }: Props) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-card transition-all hover:shadow-elegant">
      <div className={cn("absolute -end-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br opacity-10 transition-opacity group-hover:opacity-20", VARIANTS[variant])} />
      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md", VARIANTS[variant])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3 text-3xl font-bold tracking-tight">{value}</div>
        {trend && <p className="mt-1 text-xs text-muted-foreground">{trend}</p>}
      </div>
    </div>
  );
}

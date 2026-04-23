import { Badge } from "@/components/ui/badge";
import { STATUS_VARIANTS, SUBMISSION_STATUS_LABELS, type SubmissionStatus } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const VARIANT_CLASSES: Record<string, string> = {
  default: "bg-muted text-muted-foreground border-border",
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/20 text-warning-foreground border-warning/40",
  destructive: "bg-destructive/15 text-destructive border-destructive/30",
  info: "bg-info/15 text-info border-info/30",
};

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  const variant = STATUS_VARIANTS[status];
  return (
    <Badge variant="outline" className={cn("font-medium", VARIANT_CLASSES[variant])}>
      {SUBMISSION_STATUS_LABELS[status]}
    </Badge>
  );
}

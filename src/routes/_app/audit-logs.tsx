import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldAlert, Search, Filter, History, User, Activity, Database, Calendar } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_app/audit-logs")({
  beforeLoad: ({ context }) => {
    // @ts-ignore
    if (context.auth?.user?.role !== "SystemSupervisor") {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: AuditLogsPage,
});

// Mock Audit Logs
const MOCK_AUDIT_LOGS = [
  { id: 1, userId: "admin", userName: "حسين علي", actionType: "UPDATE", tableName: "Users", recordId: "10245", actionDate: "2025-10-15 14:30:22", ipAddress: "192.168.1.55", details: "تفعيل حساب مستخدم جديد" },
  { id: 2, userId: "committee_head", userName: "د. سامر فريد", actionType: "INSERT", tableName: "EvaluatorAssignments", recordId: "A-5021", actionDate: "2025-10-15 10:15:00", ipAddress: "10.0.0.12", details: "إسناد بحث للمقيم" },
  { id: 3, userId: "system", userName: "النظام الآلي", actionType: "UPDATE", tableName: "Submissions", recordId: "SUB-889", actionDate: "2025-10-15 00:01:05", ipAddress: "127.0.0.1", details: "رفع حظر الانتحال تلقائياً (sp_DailySystemCleanup)" },
  { id: 4, userId: "10488", userName: "سارة محمود", actionType: "INSERT", tableName: "Submissions", recordId: "SUB-990", actionDate: "2025-10-14 11:20:45", ipAddress: "192.168.1.104", details: "تقديم بحث جديد للدرجة الثانية" },
  { id: 5, userId: "admin", userName: "حسين علي", actionType: "DELETE", tableName: "SystemSettings", recordId: "GradeChangeYears", actionDate: "2025-10-13 09:05:10", ipAddress: "192.168.1.55", details: "تعديل إعدادات النظام" },
];

function AuditLogsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  if (!user || user.role !== "SystemSupervisor") return null;

  const filteredLogs = MOCK_AUDIT_LOGS.filter((log) => {
    const matchesSearch = log.userName.includes(search) || log.tableName.includes(search) || log.details.includes(search);
    const matchesAction = actionFilter === "ALL" || log.actionType === actionFilter;
    return matchesSearch && matchesAction;
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case "INSERT": return "text-success bg-success/10 border-success/20";
      case "UPDATE": return "text-info bg-info/10 border-info/20";
      case "DELETE": return "text-destructive bg-destructive/10 border-destructive/20";
      default: return "text-muted-foreground bg-muted border-border";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="سجل التدقيق (Audit Logs)"
        description="مراقبة كافة حركات وتغييرات النظام لأغراض الأمان والتدقيق"
      />

      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            سجل حركات النظام
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="ابحث في السجل..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="w-4 h-4 me-2 text-muted-foreground" />
                <SelectValue placeholder="نوع العملية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">كل العمليات</SelectItem>
                <SelectItem value="INSERT">إضافة (INSERT)</SelectItem>
                <SelectItem value="UPDATE">تعديل (UPDATE)</SelectItem>
                <SelectItem value="DELETE">حذف (DELETE)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-muted/50 text-muted-foreground border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium">العملية</th>
                    <th className="px-4 py-3 font-medium">المستخدم</th>
                    <th className="px-4 py-3 font-medium">الجدول / السجل</th>
                    <th className="px-4 py-3 font-medium">التفاصيل</th>
                    <th className="px-4 py-3 font-medium">التاريخ والوقت</th>
                    <th className="px-4 py-3 font-medium">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                        <History className="h-10 w-10 opacity-20 mx-auto mb-3" />
                        لا توجد سجلات مطابقة للبحث
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold border ${getActionColor(log.actionType)}`}>
                            <Activity className="w-3 h-3 me-1" />
                            {log.actionType}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <User className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <div className="font-medium">{log.userName}</div>
                              <div className="text-[10px] text-muted-foreground" dir="ltr">{log.userId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 font-mono text-xs">
                            <Database className="w-3 h-3 text-muted-foreground" />
                            {log.tableName}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">ID: {log.recordId}</div>
                        </td>
                        <td className="px-4 py-3 text-xs max-w-[200px] truncate" title={log.details}>
                          {log.details}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground" dir="ltr">
                            <Calendar className="w-3 h-3" />
                            {log.actionDate}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground" dir="ltr">
                          {log.ipAddress}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

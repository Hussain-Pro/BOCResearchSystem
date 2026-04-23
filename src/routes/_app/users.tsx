import { createFileRoute } from "@tanstack/react-router";
import { UserPlus, Shield, Mail } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockUsers, ROLE_LABELS } from "@/lib/mockData";

export const Route = createFileRoute("/_app/users")({
  component: UsersPage,
});

function UsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة المستخدمين"
        description="إدارة حسابات الموظفين والمستخدمين في النظام"
        actions={<Button className="bg-gradient-primary shadow-glow"><UserPlus className="me-2 h-4 w-4" />مستخدم جديد</Button>}
      />

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المستخدم</TableHead>
              <TableHead>المسمى الوظيفي</TableHead>
              <TableHead>القسم</TableHead>
              <TableHead>الدور</TableHead>
              <TableHead>الدرجة</TableHead>
              <TableHead>نشط</TableHead>
              <TableHead className="text-end">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockUsers.map((u) => (
              <TableRow key={u.id} className="hover:bg-accent/30">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {u.fullName.split(" ")[1]?.[0] ?? u.fullName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{u.fullName}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="h-3 w-3" />{u.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{u.jobTitle}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{u.department}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/30">
                    <Shield className="me-1 h-3 w-3" />{ROLE_LABELS[u.role]}
                  </Badge>
                </TableCell>
                <TableCell><span className="rounded bg-secondary px-2 py-0.5 text-xs">{u.jobGrade}</span></TableCell>
                <TableCell><Switch defaultChecked /></TableCell>
                <TableCell className="text-end">
                  <Button variant="ghost" size="sm">تحرير</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

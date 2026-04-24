import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileText,
  FilePlus2,
  Users,
  ClipboardList,
  Calendar,
  Inbox,
  GraduationCap,
  Settings,
  LogOut,
  Bell,
  Search,
  ShieldCheck,
  UserCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ROLE_LABELS, type RoleKey, mockNotifications } from "@/lib/mockData";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NavItem {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
  roles: RoleKey[];
}

const NAV: NavItem[] = [
  { title: "الرئيسية", url: "/dashboard", icon: LayoutDashboard, roles: ["SystemSupervisor","CommitteeHead","CommitteeDeputy","Secretary","OriginalMember","Evaluator","Employee","Assistant","DataEntry"] },
  { title: "تقديم بحث جديد", url: "/submit", icon: FilePlus2, roles: ["Employee"] },
  { title: "بحوثي", url: "/my-submissions", icon: FileText, roles: ["Employee"] },
  { title: "كل التقديمات", url: "/submissions", icon: Inbox, roles: ["SystemSupervisor","CommitteeHead","CommitteeDeputy","Secretary","Assistant","DataEntry"] },
  { title: "المراجعات الموكلة", url: "/assigned", icon: ClipboardList, roles: ["OriginalMember","CommitteeHead","CommitteeDeputy"] },
  { title: "التقييمات", url: "/evaluations", icon: GraduationCap, roles: ["Evaluator"] },
  { title: "الوجبات (الدرجة 2)", url: "/batches", icon: FileText, roles: ["SystemSupervisor","CommitteeHead","Secretary"] },
  { title: "الاجتماعات", url: "/sessions", icon: Calendar, roles: ["SystemSupervisor","CommitteeHead","CommitteeDeputy","Secretary","OriginalMember"] },
  { title: "إدارة المستخدمين", url: "/users", icon: Users, roles: ["SystemSupervisor"] },
  { title: "إدارة المُقيِّمين", url: "/evaluators", icon: ShieldCheck, roles: ["SystemSupervisor","CommitteeHead"] },
  { title: "الإعدادات", url: "/settings", icon: Settings, roles: ["SystemSupervisor"] },
];

function AppSidebar() {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return null;

  const items = NAV.filter((n) => n.roles.includes(user.role as RoleKey));

  return (
    <Sidebar collapsible="icon" side="right">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="font-bold text-sidebar-foreground">نظام البحوث</div>
            <div className="truncate text-xs text-sidebar-foreground/60">شركة نفط البصرة</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>القوائم الرئيسية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = location.pathname === item.url || location.pathname.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                      className="data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <Avatar className="h-9 w-9 ring-2 ring-sidebar-primary/40">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
              {user.fullName?.split(" ")[1]?.[0] ?? user.fullName?.[0] ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <div className="truncate text-sm font-semibold text-sidebar-foreground">{user.fullName}</div>
            <div className="truncate text-xs text-sidebar-foreground/60">{(ROLE_LABELS as any)[user.role]}</div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function AppHeader() {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const unreadCount = mockNotifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card/80 px-4 shadow-sm backdrop-blur-md">
      <SidebarTrigger className="shrink-0" />

      <div className="hidden flex-1 max-w-md md:block">
        <div className="relative">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="بحث في النظام..." className="pr-10" />
        </div>
      </div>

      <div className="ms-auto flex items-center gap-2">
        <Select value={user.role} onValueChange={(v: string) => switchRole(v)}>
          <SelectTrigger className="hidden h-9 w-[180px] sm:flex">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ROLE_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={"ghost" as any} size={"icon" as any} className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -end-1 -top-1 h-5 min-w-5 rounded-full px-1 text-[10px]" variant={"destructive" as any}>
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>الإشعارات</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {mockNotifications.map((n) => (
              <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 py-3">
                <div className="flex w-full items-center gap-2">
                  {n.unread && <span className="h-2 w-2 rounded-full bg-primary" />}
                  <span className="font-semibold">{n.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{n.body}</p>
                <span className="text-[10px] text-muted-foreground">{n.time}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {user.fullName?.split(" ")[1]?.[0] ?? user.fullName?.[0] ?? "?"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium md:inline">{user.fullName?.split(" ").slice(0, 2).join(" ") || "المستخدم"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="text-sm">{user.fullName}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>
              <UserCircle className="me-2 h-4 w-4" />
              الملف الشخصي
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { logout(); navigate({ to: "/" }); }}>
              <LogOut className="me-2 h-4 w-4" />
              تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div dir="rtl" className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <AppHeader />
          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

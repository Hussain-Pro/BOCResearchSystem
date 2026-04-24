import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Send, Inbox, PenSquare, Search } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/messages")({
  component: MessagesPage,
});

// Mock Messages
const MOCK_MESSAGES = [
  { id: 1, sender: "أحمد علي", subject: "تحديث بخصوص البحث المرفق", body: "يرجى مراجعة التعديلات الأخيرة على البحث وإعلامي.", date: "2025-10-15 10:30", isRead: false, type: "inbox" },
  { id: 2, sender: "لجنة الترقيات", subject: "موعد الاجتماع القادم", body: "نود إعلامكم بأن الاجتماع القادم سيعقد يوم الأحد.", date: "2025-10-14 09:15", isRead: true, type: "inbox" },
  { id: 3, receiver: "مشرف النظام", subject: "طلب دعم فني", body: "أواجه مشكلة في رفع المستندات، يرجى المساعدة.", date: "2025-10-13 14:20", isRead: true, type: "outbox" },
];

function MessagesPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeForm, setComposeForm] = useState({ to: "", subject: "", body: "" });

  if (!user) return null;

  const inboxMessages = MOCK_MESSAGES.filter(m => m.type === "inbox" && (m.subject.includes(search) || m.sender?.includes(search)));
  const outboxMessages = MOCK_MESSAGES.filter(m => m.type === "outbox" && (m.subject.includes(search) || m.receiver?.includes(search)));

  const handleSendMessage = () => {
    if (!composeForm.to || !composeForm.subject || !composeForm.body) {
      toast.error("الرجاء ملء جميع الحقول المطلوبة");
      return;
    }
    toast.success("تم إرسال الرسالة بنجاح");
    setIsComposeOpen(false);
    setComposeForm({ to: "", subject: "", body: "" });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="الرسائل الداخلية"
        description="إدارة المراسلات والتواصل الداخلي"
        actions={
          <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary shadow-glow">
                <PenSquare className="me-2 h-4 w-4" />
                رسالة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]" dir="rtl">
              <DialogHeader>
                <DialogTitle>إرسال رسالة جديدة</DialogTitle>
                <DialogDescription>
                  أدخل تفاصيل الرسالة ومستلمها.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="to">إلى (الرقم الوظيفي أو الاسم)</Label>
                  <Input 
                    id="to" 
                    value={composeForm.to} 
                    onChange={(e) => setComposeForm({...composeForm, to: e.target.value})} 
                    placeholder="ابحث عن الموظف..." 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">الموضوع</Label>
                  <Input 
                    id="subject" 
                    value={composeForm.subject} 
                    onChange={(e) => setComposeForm({...composeForm, subject: e.target.value})} 
                    placeholder="عنوان الرسالة" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="body">نص الرسالة</Label>
                  <Textarea 
                    id="body" 
                    value={composeForm.body} 
                    onChange={(e) => setComposeForm({...composeForm, body: e.target.value})} 
                    placeholder="اكتب رسالتك هنا..." 
                    rows={5}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsComposeOpen(false)}>إلغاء</Button>
                <Button onClick={handleSendMessage}>إرسال</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="inbox" className="w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="inbox" className="flex gap-2">
                  <Inbox className="h-4 w-4" />
                  صندوق الوارد
                </TabsTrigger>
                <TabsTrigger value="outbox" className="flex gap-2">
                  <Send className="h-4 w-4" />
                  المرسل
                </TabsTrigger>
              </TabsList>
              
              <div className="relative w-full md:w-64">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="ابحث في الرسائل..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            <TabsContent value="inbox" className="space-y-4">
              {inboxMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Mail className="h-12 w-12 opacity-20 mb-4" />
                  <p>لا توجد رسائل واردة</p>
                </div>
              ) : (
                <div className="divide-y rounded-md border">
                  {inboxMessages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col p-4 transition-colors hover:bg-muted/50 cursor-pointer ${!msg.isRead ? 'bg-primary/5' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`h-2 w-2 rounded-full ${!msg.isRead ? 'bg-primary' : 'bg-transparent'}`} />
                          <span className={`font-medium ${!msg.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>من: {msg.sender}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{msg.date}</span>
                      </div>
                      <div className="mt-1 ps-5">
                        <h4 className="font-semibold text-sm">{msg.subject}</h4>
                        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{msg.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="outbox" className="space-y-4">
              {outboxMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Send className="h-12 w-12 opacity-20 mb-4" />
                  <p>لا توجد رسائل مرسلة</p>
                </div>
              ) : (
                <div className="divide-y rounded-md border">
                  {outboxMessages.map((msg) => (
                    <div key={msg.id} className="flex flex-col p-4 transition-colors hover:bg-muted/50 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-muted-foreground text-sm">إلى: {msg.receiver}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{msg.date}</span>
                      </div>
                      <div className="mt-1">
                        <h4 className="font-semibold text-sm">{msg.subject}</h4>
                        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{msg.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

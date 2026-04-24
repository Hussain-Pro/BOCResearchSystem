// ============================================================
// Mock data for ERS - Basrah Oil Company Research System
// Replace these with real API calls to ASP.NET backend later
// ============================================================

export type RoleKey =
  | "SystemSupervisor"
  | "CommitteeHead"
  | "CommitteeDeputy"
  | "Secretary"
  | "OriginalMember"
  | "Evaluator"
  | "Employee"
  | "Assistant"
  | "DataEntry";

export const ROLE_LABELS: Record<RoleKey, string> = {
  SystemSupervisor: "مشرف النظام",
  CommitteeHead: "رئيس اللجنة",
  CommitteeDeputy: "وكيل الرئيس",
  Secretary: "السكرتير",
  OriginalMember: "عضو لجنة",
  Evaluator: "مُقيِّم",
  Employee: "موظف",
  Assistant: "مساند",
  DataEntry: "مدخل بيانات",
};

export interface MockUser {
  id: string;
  fullName: string;
  jobTitle: string;
  jobGrade: 1 | 2 | 3;
  department: string;
  email: string;
  role: RoleKey;
  qualification: string;
  lastGradeChangeDate: string;
  twoFactorEnabled?: boolean;
  phone?: string;
  avatarUrl?: string;
}

export const mockActivationCodes: string[] = [
  "ERS-2025",
  "BOC-9931",
  "RND-4477",
  "EMP-1024",
];

export const mockDepartments: string[] = [
  "الإدارة العامة",
  "الأبحاث والتطوير",
  "الإنتاج",
  "حقول الرميلة",
  "حقول غرب القرنة",
  "السلامة المهنية",
  "الموارد البشرية",
  "تكنولوجيا المعلومات",
];

export const mockQualifications: string[] = [
  "بكالوريوس",
  "دبلوم عالي",
  "ماجستير",
  "دكتوراه",
];

export const mockUsers: MockUser[] = [
  {
    id: "u1",
    fullName: "د. علي حسين الجابري",
    jobTitle: "مدير عام الأبحاث",
    jobGrade: 1,
    department: "الإدارة العامة",
    email: "ali.alsystem@boc.iq",
    role: "SystemSupervisor",
    qualification: "دكتوراه - هندسة نفط",
    lastGradeChangeDate: "2021-03-15",
  },
  {
    id: "u2",
    fullName: "د. محمد كاظم الموسوي",
    jobTitle: "رئيس قسم الأبحاث",
    jobGrade: 1,
    department: "الأبحاث والتطوير",
    email: "mohammed.k@boc.iq",
    role: "CommitteeHead",
    qualification: "دكتوراه - كيمياء صناعية",
    lastGradeChangeDate: "2020-11-02",
  },
  {
    id: "u3",
    fullName: "أ. زينب عبد الرضا",
    jobTitle: "سكرتيرة اللجنة",
    jobGrade: 2,
    department: "الأبحاث والتطوير",
    email: "zainab.ar@boc.iq",
    role: "Secretary",
    qualification: "بكالوريوس إدارة",
    lastGradeChangeDate: "2022-06-10",
  },
  {
    id: "u4",
    fullName: "م. حيدر صبحي",
    jobTitle: "مهندس أول",
    jobGrade: 2,
    department: "الإنتاج",
    email: "haidar.s@boc.iq",
    role: "OriginalMember",
    qualification: "ماجستير هندسة ميكانيك",
    lastGradeChangeDate: "2021-09-20",
  },
  {
    id: "u5",
    fullName: "د. سارة عبد الله",
    jobTitle: "مُقيِّم خارجي",
    jobGrade: 1,
    department: "جامعة البصرة",
    email: "sara.eval@uobasrah.edu.iq",
    role: "Evaluator",
    qualification: "دكتوراه - هندسة نفط",
    lastGradeChangeDate: "2019-04-01",
  },
  {
    id: "u6",
    fullName: "م. أحمد فاضل العتابي",
    jobTitle: "مهندس إنتاج",
    jobGrade: 3,
    department: "حقول الرميلة",
    email: "ahmed.f@boc.iq",
    role: "Employee",
    qualification: "بكالوريوس هندسة نفط",
    lastGradeChangeDate: "2022-01-15",
  },
];

export type SubmissionType = 1 | 2 | 3 | 4; // بحث | تقرير | دورة | منشور
export type SubmissionStatus = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export const SUBMISSION_TYPE_LABELS: Record<SubmissionType, string> = {
  1: "بحث علمي",
  2: "تقرير فني",
  3: "منهج دورة",
  4: "بحث منشور",
};

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  1: "جديد",
  2: "مطابق",
  3: "غير مطابق",
  4: "ناجح",
  5: "غير ناجح",
  6: "مرفوض",
  7: "تم تعديله",
  8: "جديد بعد الطلب",
  9: "مغلق",
  10: "تم استبداله",
  11: "مستوفٍ",
};

export const STATUS_VARIANTS: Record<SubmissionStatus, "default" | "success" | "warning" | "destructive" | "info"> = {
  1: "info",
  2: "success",
  3: "warning",
  4: "success",
  5: "destructive",
  6: "destructive",
  7: "info",
  8: "info",
  9: "default",
  10: "default",
  11: "success",
};

export interface MockSubmission {
  id: string;
  employeeId: string;
  employeeName: string;
  jobGrade: 1 | 2 | 3;
  title: string;
  type: SubmissionType;
  status: SubmissionStatus;
  submittedAt: string;
  committeeId?: string;
  assignedEvaluatorId?: string;
  evaluatorScore?: number;
  committeeScore?: number;
  finalScore?: number;
  notes?: string;
}

export const mockSubmissions: MockSubmission[] = [
  {
    id: "s1",
    employeeId: "u6",
    employeeName: "م. أحمد فاضل العتابي",
    jobGrade: 3,
    title: "تحسين إنتاجية آبار النفط باستخدام التحفيز الكيميائي",
    type: 1,
    status: 2,
    submittedAt: "2025-02-12",
    committeeId: "c1",
    assignedEvaluatorId: "u5",
    evaluatorScore: 82,
    committeeScore: 25,
    finalScore: 82 * 0.7 + 25,
  },
  {
    id: "s2",
    employeeId: "u6",
    employeeName: "م. أحمد فاضل العتابي",
    jobGrade: 3,
    title: "تقرير فني عن صيانة محطات العزل",
    type: 2,
    status: 4,
    submittedAt: "2024-11-30",
    committeeId: "c1",
    evaluatorScore: 78,
    finalScore: 78,
  },
  {
    id: "s3",
    employeeId: "u4",
    employeeName: "م. حيدر صبحي",
    jobGrade: 2,
    title: "دراسة ميكانيكية لأنابيب نقل النفط الخام",
    type: 1,
    status: 1,
    submittedAt: "2025-04-01",
  },
  {
    id: "s4",
    employeeId: "u6",
    employeeName: "م. أحمد فاضل العتابي",
    jobGrade: 3,
    title: "منهج دورة: السلامة المهنية في حقول النفط",
    type: 3,
    status: 11,
    submittedAt: "2025-01-20",
    finalScore: 85,
  },
  {
    id: "s5",
    employeeId: "u4",
    employeeName: "م. حيدر صبحي",
    jobGrade: 2,
    title: "بحث منشور: التآكل في خزانات النفط",
    type: 4,
    status: 6,
    submittedAt: "2025-03-05",
    notes: "تاريخ النشر خارج مدة التغيير",
  },
  {
    id: "s6",
    employeeId: "u6",
    employeeName: "م. أحمد فاضل العتابي",
    jobGrade: 3,
    title: "نمذجة المكامن النفطية بطرق الذكاء الاصطناعي",
    type: 1,
    status: 7,
    submittedAt: "2025-03-22",
    committeeId: "c1",
  },
];

export interface MockBatch {
  id: string;
  number: number;
  year: number;
  status: 1 | 2 | 3 | 4 | 5 | 6;
  submissionsCount: number;
  outgoingNumber?: string;
  outgoingDate?: string;
  createdAt: string;
}

export const BATCH_STATUS_LABELS: Record<number, string> = {
  1: "جديدة",
  2: "أُرسلت للموافقة",
  3: "أُرسلت للوزارة",
  4: "استُلمت من الوزارة",
  5: "اكتملت",
  6: "مؤرشفة",
};

export const mockBatches: MockBatch[] = [
  { id: "b1", number: 12, year: 2025, status: 3, submissionsCount: 8, outgoingNumber: "2025/487", outgoingDate: "2025-03-10", createdAt: "2025-03-01" },
  { id: "b2", number: 11, year: 2025, status: 5, submissionsCount: 12, outgoingNumber: "2025/391", outgoingDate: "2025-02-05", createdAt: "2025-01-25" },
  { id: "b3", number: 13, year: 2025, status: 1, submissionsCount: 3, createdAt: "2025-04-15" },
];

export interface MockSession {
  id: string;
  number: number;
  date: string;
  time: string;
  location: string;
  status: 1 | 2 | 3;
  submissionsCount: number;
}

export const mockSessions: MockSession[] = [
  { id: "se1", number: 24, date: "2025-04-30", time: "10:00", location: "قاعة اجتماعات الإدارة العامة", status: 1, submissionsCount: 6 },
  { id: "se2", number: 23, date: "2025-03-28", time: "10:00", location: "قاعة اجتماعات الإدارة العامة", status: 2, submissionsCount: 5 },
  { id: "se3", number: 22, date: "2025-02-25", time: "10:00", location: "قاعة اجتماعات الإدارة العامة", status: 3, submissionsCount: 7 },
];

export const SESSION_STATUS_LABELS: Record<number, string> = {
  1: "مجدول",
  2: "منعقد",
  3: "مؤرشف",
};

export const EVALUATION_CRITERIA = [
  { id: 1, name: "المستوى من الناحية العلمية", max: 30 },
  { id: 2, name: "الإيضاحات الكافية والنتائج بالشكل المطلوب", max: 20 },
  { id: 3, name: "مستوى الأصالة أو البعد التطبيقي", max: 10 },
  { id: 4, name: "مستوى المصادر المعتمدة", max: 10 },
  { id: 5, name: "مدى الاستفادة من البحث", max: 15 },
  { id: 6, name: "صلاحية اللغة والتبويب وأسلوب العرض", max: 15 },
];

export const mockNotifications = [
  { id: "n1", title: "بحث جديد بحاجة لمراجعة", body: "تم تقديم بحث 'نمذجة المكامن النفطية' بانتظار المراجعة", time: "قبل ساعتين", unread: true },
  { id: "n2", title: "تم تحديد موعد اجتماع", body: "اجتماع رقم 24 يوم 30/04/2025 الساعة 10:00", time: "أمس", unread: true },
  { id: "n3", title: "نتيجة الوزارة", body: "وصلت نتيجة الوجبة رقم 11 — 10 بحوث ناجحة", time: "قبل 3 أيام", unread: false },
];

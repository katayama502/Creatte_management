// ============================================================
// Student types
// ============================================================

export type StudentStatus =
  | "trial_pending"
  | "trial_completed"
  | "enrolled"
  | "active"
  | "inactive";

export type CourseFrequency = 1 | 2 | 3 | 4;

export interface Student {
  id: string;
  name: string;
  nameKana: string;
  email: string;
  phone: string;
  birthDate?: string;
  guardianName?: string;
  guardianPhone?: string;
  address?: string;
  status: StudentStatus;
  trialDate?: string;
  trialTeacherId?: string;
  enrollmentDate?: string;
  courseFrequency?: CourseFrequency;
  teacherId?: string;
  /** 0 = Sunday, 1 = Monday, ..., 6 = Saturday */
  preferredDays?: number[];
  preferredTime?: string;
  notes?: string;
  createdAt: string;
}

// ============================================================
// Teacher types
// ============================================================

export interface Teacher {
  id: string;
  name: string;
  nameKana: string;
  email: string;
  phone: string;
  /** 0 = Sunday, 1 = Monday, ..., 6 = Saturday */
  availableDays: number[];
  subjects: string[];
  /** Hex color used for calendar display */
  color: string;
  maxStudents: number;
}

// ============================================================
// Lesson / Schedule types
// ============================================================

export type LessonStatus = "scheduled" | "completed" | "cancelled";

export type AttendanceStatus = 'attended' | 'absent' | 'late' | 'makeup';

export interface Lesson {
  id: string;
  studentId: string;
  teacherId: string;
  /** ISO date string: YYYY-MM-DD */
  date: string;
  /** HH:mm */
  startTime: string;
  /** HH:mm */
  endTime: string;
  status: LessonStatus;
  isRecurring: boolean;
  notes?: string;
  attendanceStatus?: AttendanceStatus;
  /** What was taught this lesson */
  lessonContent?: string;
  /** Homework assigned */
  homeworkNote?: string;
  /** If this is a makeup, the ID of the original cancelled lesson */
  isMakeupFor?: string;
}

// ============================================================
// Enrollment form types
// ============================================================

export interface EnrollmentFormData {
  studentId: string;
  guardianName: string;
  guardianPhone: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  courseFrequency: CourseFrequency;
  /** 0 = Sunday, 1 = Monday, ..., 6 = Saturday */
  preferredDays: number[];
  preferredTime: string;
  /** ISO date string: YYYY-MM-DD */
  startDate: string;
  medicalNotes?: string;
  agreedToTerms: boolean;
  /** Set server-side when the form is submitted */
  submittedAt?: string;
}

// ============================================================
// Dashboard panel types
// ============================================================

export type DashboardPanelType =
  | "stats"
  | "recent_students"
  | "upcoming_lessons"
  | "teacher_load";

export interface DashboardPanel {
  id: string;
  title: string;
  type: DashboardPanelType;
  position: number;
  visible: boolean;
}

// ============================================================
// Utility / shared types
// ============================================================

export interface SelectOption<T = string> {
  label: string;
  value: T;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

// ============================================================
// Task types (サイボウズ ToDo 参考)
// ============================================================

export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskCategory = 'kurietto' | 'techice' | 'training' | 'other';
export type RecurringInterval = 'weekly' | 'monthly';

export interface Task {
  id: string;
  title: string;
  description?: string;
  /** Teacher/staff ID */
  assigneeId?: string;
  /** ISO date string: YYYY-MM-DD */
  dueDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: TaskCategory;
  isRecurring?: boolean;
  recurringInterval?: RecurringInterval;
  /** Related student or sponsor ID */
  relatedId?: string;
  notes?: string;
  completedAt?: string;
  createdAt: string;
}

// ============================================================
// Sponsor types (協賛企業管理)
// ============================================================

export type SponsorStatus = 'active' | 'pending' | 'inactive';
export type ContactMethod = 'visit' | 'email' | 'phone' | 'other';

export interface Sponsor {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail?: string;
  contactPhone?: string;
  industry?: string;
  /** Annual sponsorship amount in yen */
  amount: number;
  /** ISO date string */
  startDate: string;
  endDate?: string;
  status: SponsorStatus;
  fliersPlaced?: boolean;
  cardsDistributed?: number;
  nextContactDate?: string;
  notes?: string;
  createdAt: string;
}

export interface SponsorContact {
  id: string;
  sponsorId: string;
  /** ISO date string */
  date: string;
  method: ContactMethod;
  summary: string;
  nextAction?: string;
  staffName?: string;
  createdAt: string;
}

// ============================================================
// Scratch work types (クリエット独自)
// ============================================================

export interface ScratchWork {
  id: string;
  studentId: string;
  title: string;
  /** Scratch project URL */
  url?: string;
  description?: string;
  /** ISO date string: YYYY-MM-DD */
  createdDate: string;
  tags?: string[];
  /** Featured in portfolio */
  isPortfolio?: boolean;
  createdAt: string;
}

// ============================================================
// Curriculum progress types (カリキュラム進捗)
// ============================================================

export interface CurriculumProgress {
  id: string;
  studentId: string;
  courseId?: string;
  /** e.g. "Scratch入門 第3章" */
  materialName: string;
  /** ISO date string */
  completedAt: string;
  notes?: string;
}

// ===== Settings =====
export interface Course {
  id: string
  name: string
  description: string
  color: string          // hex color
  targetAge: string      // e.g. "小学1年〜6年"
  active: boolean
}

export type DiscountType = 'percentage' | 'fixed'

export interface Discount {
  id: string
  name: string           // e.g. "兄弟割引"
  type: DiscountType
  value: number          // % or yen
  description: string
  active: boolean
  stackable: boolean     // whether this discount stacks with others
}

export interface FeeRule {
  frequency: CourseFrequency
  amount: number
}

export interface SchoolSettings {
  name: string           // e.g. "クリエットプログラミング教室"
  subtitle: string       // e.g. "プログラミング教室"
  address: string
  phone: string
  email: string
  website: string
  trialFee: number       // 体験会費
  enrollmentFee: number  // 入会金
  materialsFee: number   // 教材費（初回）
  notes: string          // 規約・備考
}

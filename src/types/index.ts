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

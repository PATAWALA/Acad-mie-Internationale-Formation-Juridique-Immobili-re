// types/database.ts

export type ProfileRole = 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN';
export type ProfileStatus = 'PENDING_PAYMENT' | 'PAID' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';
export type NotificationType = 'payment' | 'system' | 'course' | 'warning';
export type SubmissionStatus = 'PENDING' | 'GRADED' | 'PASSED' | 'FAILED';
export type AssessmentType = 'TP' | 'EXAM';
export type ContentType = 'VIDEO' | 'PDF' | 'TEXT' | 'LINK';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string | null;
  role: ProfileRole;
  status: ProfileStatus;
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: number;
  title: string;
  slug: string;
  price_normal: number;
  price_bourse: number;
  created_at?: string | null;
}

export interface Enrollment {
  id: number;
  student_id: string;
  student_name: string;
  certificate_id: number;
  phone?: string | null;
  email?: string | null;
  amount_paid: number;
  remaining_balance: number;
  payment_status: PaymentStatus;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Course {
  id: string;
  title: string;
  description?: string | null;
  certificate_id: number;
  duration_weeks?: number | null;
  price?: number | null;
  is_published?: boolean | null;
  created_by?: string | null;
  created_at: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description?: string | null;
  week_number: number;
  created_at: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content_type: ContentType;
  content_url?: string | null;
  content_body?: string | null;
  position?: number | null;
  created_at: string;
}

export interface Assessment {
  id: string;
  module_id?: string | null;
  course_id?: string | null;
  title: string;
  description?: string | null;
  type: AssessmentType;
  max_score?: number | null;
  created_at: string;
}

export interface Submission {
  id: number;
  student_id: string;
  assessment_id: string;
  submission_url: string;
  grade?: number | null;
  feedback?: string | null;
  status: SubmissionStatus;
  created_at?: string | null;
  graded_at?: string | null;
}

export interface IssuedCertificate {
  id: number;
  student_id: string;
  course_id: string;
  certificate_url: string;
  issued_at?: string | null;
}

export interface Teacher {
  id: number;
  teacher_id?: string | null;
  full_name: string;
  email: string;
  phone?: string | null;
  created_at?: string | null;
}

// Database global type (à jour)
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id'>>;
      };
      certificates: {
        Row: Certificate;
        Insert: Omit<Certificate, 'id' | 'created_at'>;
        Update: Partial<Omit<Certificate, 'id'>>;
      };
      enrollments: {
        Row: Enrollment;
        Insert: Omit<Enrollment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Enrollment, 'id'>>;
      };
      courses: {
        Row: Course;
        Insert: Omit<Course, 'id' | 'created_at'>;
        Update: Partial<Omit<Course, 'id'>>;
      };
      modules: {
        Row: Module;
        Insert: Omit<Module, 'id' | 'created_at'>;
        Update: Partial<Omit<Module, 'id'>>;
      };
      lessons: {
        Row: Lesson;
        Insert: Omit<Lesson, 'id' | 'created_at'>;
        Update: Partial<Omit<Lesson, 'id'>>;
      };
      assessments: {
        Row: Assessment;
        Insert: Omit<Assessment, 'id' | 'created_at'>;
        Update: Partial<Omit<Assessment, 'id'>>;
      };
      submissions: {
        Row: Submission;
        Insert: Omit<Submission, 'id' | 'created_at' | 'graded_at'>;
        Update: Partial<Omit<Submission, 'id'>>;
      };
      issued_certificates: {
        Row: IssuedCertificate;
        Insert: Omit<IssuedCertificate, 'id' | 'issued_at'>;
        Update: Partial<Omit<IssuedCertificate, 'id'>>;
      };
      teachers: {
        Row: Teacher;
        Insert: Omit<Teacher, 'id' | 'created_at'>;
        Update: Partial<Omit<Teacher, 'id'>>;
      };
    };
    Views: {};
    Functions: {};
  };
};
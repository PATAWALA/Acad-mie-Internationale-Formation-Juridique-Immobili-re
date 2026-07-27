export interface Teacher {
  id: number;
  teacher_id?: string;
  full_name: string;
  email: string;
  phone?: string;
  created_at?: string;
}

export interface Certificate {
  id: number;
  title: string;
  slug: string;
  price_normal: number;
  price_bourse: number;
}

export interface Enrollment {
  id: number;
  student_id?: string;
  student_name: string;
  certificate_id: number;
  amount_paid: number;
  remaining_balance: number;
  payment_status: 'PENDING' | 'PAID' | 'FAILED';
  receipt_url?: string;
  reload_count: number;
  current_week: number;
  certificates?: Certificate;
}

export interface Submission {
  id: number;
  student_name: string;
  file_url: string;
  status: 'PENDING' | 'CORRECTED';
  grade?: number;
  comment?: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'SUPER_ADMIN' | 'TEACHER' | 'STUDENT';
}
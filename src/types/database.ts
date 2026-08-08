export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      assessments: {
        Row: {
          course_id: string | null
          created_at: string
          description: string | null
          id: string
          max_score: number | null
          module_id: string | null
          title: string
          type: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          max_score?: number | null
          module_id?: string | null
          title: string
          type?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          max_score?: number | null
          module_id?: string | null
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      certificate_teachers: {
        Row: {
          certificate_id: number
          created_at: string | null
          id: number
          teacher_id: string
        }
        Insert: {
          certificate_id: number
          created_at?: string | null
          id?: never
          teacher_id: string
        }
        Update: {
          certificate_id?: number
          created_at?: string | null
          id?: never
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificate_teachers_certificate_id_fkey"
            columns: ["certificate_id"]
            isOneToOne: false
            referencedRelation: "certificates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificate_teachers_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          benefits: string | null
          brochure_url: string | null
          created_at: string | null
          id: number
          image_url: string | null
          price_bourse: number
          price_normal: number
          skills: string | null
          slogan: string | null
          slug: string
          target_audience: string | null
          title: string
        }
        Insert: {
          benefits?: string | null
          brochure_url?: string | null
          created_at?: string | null
          id?: number
          image_url?: string | null
          price_bourse?: number
          price_normal?: number
          skills?: string | null
          slogan?: string | null
          slug: string
          target_audience?: string | null
          title: string
        }
        Update: {
          benefits?: string | null
          brochure_url?: string | null
          created_at?: string | null
          id?: number
          image_url?: string | null
          price_bourse?: number
          price_normal?: number
          skills?: string | null
          slogan?: string | null
          slug?: string
          target_audience?: string | null
          title?: string
        }
        Relationships: []
      }
      classes_teachers: {
        Row: {
          certificate_id: number | null
          id: number
          teacher_id: string | null
        }
        Insert: {
          certificate_id?: number | null
          id?: never
          teacher_id?: string | null
        }
        Update: {
          certificate_id?: number | null
          id?: never
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_teachers_certificate_id_fkey"
            columns: ["certificate_id"]
            isOneToOne: false
            referencedRelation: "certificates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_teachers_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          certificate_id: number | null
          created_at: string
          created_by: string | null
          description: string | null
          duration_weeks: number | null
          id: string
          is_published: boolean | null
          price: number | null
          title: string
        }
        Insert: {
          certificate_id?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_weeks?: number | null
          id?: string
          is_published?: boolean | null
          price?: number | null
          title: string
        }
        Update: {
          certificate_id?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_weeks?: number | null
          id?: string
          is_published?: boolean | null
          price?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_certificate_id_fkey"
            columns: ["certificate_id"]
            isOneToOne: false
            referencedRelation: "certificates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          amount_paid: number
          certificate_id: number
          created_at: string | null
          current_week: number
          email: string | null
          id: number
          payment_status: string
          phone: string | null
          receipt_url: string | null
          reload_count: number
          remaining_balance: number
          student_id: string | null
          student_name: string
          updated_at: string | null
        }
        Insert: {
          amount_paid?: number
          certificate_id: number
          created_at?: string | null
          current_week?: number
          email?: string | null
          id?: never
          payment_status?: string
          phone?: string | null
          receipt_url?: string | null
          reload_count?: number
          remaining_balance?: number
          student_id?: string | null
          student_name: string
          updated_at?: string | null
        }
        Update: {
          amount_paid?: number
          certificate_id?: number
          created_at?: string | null
          current_week?: number
          email?: string | null
          id?: never
          payment_status?: string
          phone?: string | null
          receipt_url?: string | null
          reload_count?: number
          remaining_balance?: number
          student_id?: string | null
          student_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_certificate_id_fkey"
            columns: ["certificate_id"]
            isOneToOne: false
            referencedRelation: "certificates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          email: string
          event_id: number | null
          full_name: string
          id: number
          phone: string
          registered_at: string | null
        }
        Insert: {
          email: string
          event_id?: number | null
          full_name: string
          id?: never
          phone: string
          registered_at?: string | null
        }
        Update: {
          email?: string
          event_id?: number | null
          full_name?: string
          id?: never
          phone?: string
          registered_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          date: string
          description: string | null
          id: number
          is_active: boolean | null
          practical_work: string | null
          program: Json | null
          slug: string
          theme: string
          time_end: string
          time_start: string
          title: string
          trainer: string
        }
        Insert: {
          created_at?: string | null
          date: string
          description?: string | null
          id?: never
          is_active?: boolean | null
          practical_work?: string | null
          program?: Json | null
          slug: string
          theme: string
          time_end: string
          time_start: string
          title: string
          trainer: string
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string | null
          id?: never
          is_active?: boolean | null
          practical_work?: string | null
          program?: Json | null
          slug?: string
          theme?: string
          time_end?: string
          time_start?: string
          title?: string
          trainer?: string
        }
        Relationships: []
      }
      issued_certificates: {
        Row: {
          certificate_url: string
          course_id: string | null
          id: number
          issued_at: string | null
          student_id: string | null
        }
        Insert: {
          certificate_url: string
          course_id?: string | null
          id?: never
          issued_at?: string | null
          student_id?: string | null
        }
        Update: {
          certificate_url?: string
          course_id?: string | null
          id?: never
          issued_at?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "issued_certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issued_certificates_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content_body: string | null
          content_type: string | null
          content_url: string | null
          created_at: string
          id: string
          module_id: string
          position: number | null
          title: string
        }
        Insert: {
          content_body?: string | null
          content_type?: string | null
          content_url?: string | null
          created_at?: string
          id?: string
          module_id: string
          position?: number | null
          title: string
        }
        Update: {
          content_body?: string | null
          content_type?: string | null
          content_url?: string | null
          created_at?: string
          id?: string
          module_id?: string
          position?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          title: string
          week_number: number
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          title: string
          week_number: number
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: number
          link: string | null
          message: string
          read: boolean | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: never
          link?: string | null
          message: string
          read?: boolean | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: never
          link?: string | null
          message?: string
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string | null
          description: string | null
          file_url: string | null
          id: number
          image_url: string | null
          is_active: boolean | null
          price: number
          stock: number | null
          title: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_url?: string | null
          id?: never
          image_url?: string | null
          is_active?: boolean | null
          price: number
          stock?: number | null
          title: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_url?: string | null
          id?: never
          image_url?: string | null
          is_active?: boolean | null
          price?: number
          stock?: number | null
          title?: string
          type?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          profile_type: string | null
          role: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          profile_type?: string | null
          role?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          profile_type?: string | null
          role?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      quiz_answers: {
        Row: {
          answered_at: string | null
          id: number
          is_correct: boolean | null
          question_id: number | null
          selected_answer: string
          student_id: string | null
        }
        Insert: {
          answered_at?: string | null
          id?: never
          is_correct?: boolean | null
          question_id?: number | null
          selected_answer: string
          student_id?: string | null
        }
        Update: {
          answered_at?: string | null
          id?: never
          is_correct?: boolean | null
          question_id?: number | null
          selected_answer?: string
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_answers_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          assessment_id: string | null
          correct_answer: string
          created_at: string | null
          id: number
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          points: number | null
          position: number | null
          question: string
        }
        Insert: {
          assessment_id?: string | null
          correct_answer: string
          created_at?: string | null
          id?: never
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          points?: number | null
          position?: number | null
          question: string
        }
        Update: {
          assessment_id?: string | null
          correct_answer?: string
          created_at?: string | null
          id?: never
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          points?: number | null
          position?: number | null
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      student_questions: {
        Row: {
          answer: string | null
          answered_by: string | null
          created_at: string | null
          id: number
          question: string
          status: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          answer?: string | null
          answered_by?: string | null
          created_at?: string | null
          id?: never
          question: string
          status?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          answer?: string | null
          answered_by?: string | null
          created_at?: string | null
          id?: never
          question?: string
          status?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_questions_answered_by_fkey"
            columns: ["answered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_questions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          assessment_id: string | null
          created_at: string | null
          feedback: string | null
          grade: number | null
          graded_at: string | null
          id: number
          status: string | null
          student_id: string | null
          submission_url: string
        }
        Insert: {
          assessment_id?: string | null
          created_at?: string | null
          feedback?: string | null
          grade?: number | null
          graded_at?: string | null
          id?: never
          status?: string | null
          student_id?: string | null
          submission_url: string
        }
        Update: {
          assessment_id?: string | null
          created_at?: string | null
          feedback?: string | null
          grade?: number | null
          graded_at?: string | null
          id?: never
          status?: string | null
          student_id?: string | null
          submission_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions_tp: {
        Row: {
          comment: string | null
          created_at: string | null
          enrollment_id: number | null
          file_url: string | null
          grade: number | null
          id: number
          status: string
          step_number: number
          student_id: string | null
          student_name: string
          updated_at: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          enrollment_id?: number | null
          file_url?: string | null
          grade?: number | null
          id?: never
          status?: string
          step_number?: number
          student_id?: string | null
          student_name: string
          updated_at?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          enrollment_id?: number | null
          file_url?: string | null
          grade?: number | null
          id?: never
          status?: string
          step_number?: number
          student_id?: string | null
          student_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_tp_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_tp_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers_list: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: number
          phone: string | null
          teacher_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: never
          phone?: string | null
          teacher_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: never
          phone?: string | null
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teachers_list_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_is_admin: { Args: never; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

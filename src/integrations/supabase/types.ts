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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      daily_summaries: {
        Row: {
          ai_response: string | null
          created_at: string
          date: string
          hp_lost: number
          id: string
          mood_score: number | null
          notes: string | null
          updated_at: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          ai_response?: string | null
          created_at?: string
          date: string
          hp_lost?: number
          id?: string
          mood_score?: number | null
          notes?: string | null
          updated_at?: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          ai_response?: string | null
          created_at?: string
          date?: string
          hp_lost?: number
          id?: string
          mood_score?: number | null
          notes?: string | null
          updated_at?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_summaries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_logs: {
        Row: {
          created_at: string
          date: string
          habit_id: string
          id: string
          status: Database["public"]["Enums"]["habit_status"]
        }
        Insert: {
          created_at?: string
          date: string
          habit_id: string
          id?: string
          status: Database["public"]["Enums"]["habit_status"]
        }
        Update: {
          created_at?: string
          date?: string
          habit_id?: string
          id?: string
          status?: Database["public"]["Enums"]["habit_status"]
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          archived: boolean
          created_at: string
          description: string | null
          frequency_days: number[]
          id: string
          is_bad_habit: boolean
<<<<<<< HEAD
=======
          paused_at: string | null
>>>>>>> cf46c6e (Initial commit: project files)
          sort_order: number
          title: string
          updated_at: string
          user_id: string
          xp_reward: number | null
        }
        Insert: {
          archived?: boolean
          created_at?: string
          description?: string | null
          frequency_days?: number[]
          id?: string
          is_bad_habit?: boolean
<<<<<<< HEAD
=======
          paused_at?: string | null
>>>>>>> cf46c6e (Initial commit: project files)
          sort_order?: number
          title: string
          updated_at?: string
          user_id: string
          xp_reward?: number | null
        }
        Update: {
          archived?: boolean
          created_at?: string
          description?: string | null
          frequency_days?: number[]
          id?: string
          is_bad_habit?: boolean
<<<<<<< HEAD
=======
          paused_at?: string | null
>>>>>>> cf46c6e (Initial commit: project files)
          sort_order?: number
          title?: string
          updated_at?: string
          user_id?: string
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "habits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      metric_logs: {
        Row: {
          created_at: string
          date: string
          id: string
          metric_id: string
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          metric_id: string
          user_id: string
          value: number
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          metric_id?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "metric_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          day_start_hour: number
          hp: number
          id: string
          level: number
          max_hp: number
          updated_at: string
          xp: number
        }
        Insert: {
          created_at?: string
          day_start_hour?: number
          hp?: number
          id: string
          level?: number
          max_hp?: number
          updated_at?: string
          xp?: number
        }
        Update: {
          created_at?: string
          day_start_hour?: number
          hp?: number
          id?: string
          level?: number
          max_hp?: number
          updated_at?: string
          xp?: number
        }
        Relationships: []
      }
      tasks: {
        Row: {
          archived: boolean
          completed: boolean
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_for_today: boolean
          priority: Database["public"]["Enums"]["task_priority"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_for_today?: boolean
          priority?: Database["public"]["Enums"]["task_priority"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archived?: boolean
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_for_today?: boolean
          priority?: Database["public"]["Enums"]["task_priority"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
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
      seed_user_plan: { Args: never; Returns: undefined }
    }
    Enums: {
<<<<<<< HEAD
      habit_status: "completed" | "partial" | "skipped" | "missed"
=======
      habit_status: "completed" | "partial" | "skipped" | "missed" | "paused"
>>>>>>> cf46c6e (Initial commit: project files)
      task_priority: "high" | "medium" | "low"
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
    Enums: {
      habit_status: ["completed", "partial", "skipped", "missed"],
      task_priority: ["high", "medium", "low"],
    },
  },
} as const

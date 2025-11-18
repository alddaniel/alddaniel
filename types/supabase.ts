export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_log: {
        Row: {
          id: string
          created_at: string
          type: string
          description_key: string
          description_params: Json | null
          company_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          type: string
          description_key: string
          description_params?: Json | null
          company_id: string
        }
        Update: {
          id?: string
          created_at?: string
          type?: string
          description_key?: string
          description_params?: Json | null
          company_id?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          start_time: string
          end_time: string
          due_date: string | null
          location: string
          user_participant_ids: string[] | null
          status: string
          category: string
          customer_id: string | null
          supplier_id: string | null
          company_id: string
          recurrence_rule: Json | null
          attachments: Json | null
          history: Json | null
          subtasks: Json | null
          reminder: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          start_time: string
          end_time: string
          due_date?: string | null
          location: string
          user_participant_ids?: string[] | null
          status: string
          category: string
          customer_id?: string | null
          supplier_id?: string | null
          company_id: string
          recurrence_rule?: Json | null
          attachments?: Json | null
          history?: Json | null
          subtasks?: Json | null
          reminder?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          start_time?: string
          end_time?: string
          due_date?: string | null
          location?: string
          user_participant_ids?: string[] | null
          status?: string
          category?: string
          customer_id?: string | null
          supplier_id?: string | null
          company_id?: string
          recurrence_rule?: Json | null
          attachments?: Json | null
          history?: Json | null
          subtasks?: Json | null
          reminder?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_customer_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_supplier_id_fkey"
            columns: ["supplier_id"]
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          }
        ]
      }
      customers: {
        Row: {
          id: string
          created_at: string
          name: string
          type: "Individual" | "Company"
          identifier: string
          phone: string
          email: string
          cep: string
          address: string
          status: "Active" | "Inactive"
          company_id: string
          avatar_url: string | null
          gender: "male" | "female" | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          type: "Individual" | "Company"
          identifier: string
          phone: string
          email: string
          cep: string
          address: string
          status: "Active" | "Inactive"
          company_id: string
          avatar_url?: string | null
          gender?: "male" | "female" | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          type?: "Individual" | "Company"
          identifier?: string
          phone?: string
          email?: string
          cep?: string
          address?: string
          status?: "Active" | "Inactive"
          company_id?: string
          avatar_url?: string | null
          gender?: "male" | "female" | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          id: string
          created_at: string
          name: string
          cnpj: string
          contact_person: string
          phone: string
          email: string
          services: string[]
          company_id: string
          logo_url: string | null
          contact_avatar_url: string | null
          cep: string
          address: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          cnpj: string
          contact_person: string
          phone: string
          email: string
          services: string[]
          company_id: string
          logo_url?: string | null
          contact_avatar_url?: string | null
          cep: string
          address: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          cnpj?: string
          contact_person?: string
          phone?: string
          email?: string
          services?: string[]
          company_id?: string
          logo_url?: string | null
          contact_avatar_url?: string | null
          cep?: string
          address?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: "ADMIN" | "MANAGER" | "COLLABORATOR"
          avatar_url: string | null
          company_id: string
          gender: "male" | "female" | null
          permissions: Json
          status: "active" | "pending"
        }
        Insert: {
          id: string
          name: string
          email: string
          role: "ADMIN" | "MANAGER" | "COLLABORATOR"
          avatar_url?: string | null
          company_id: string
          gender?: "male" | "female" | null
          permissions: Json
          status: "active" | "pending"
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: "ADMIN" | "MANAGER" | "COLLABORATOR"
          avatar_url?: string | null
          company_id?: string
          gender?: "male" | "female" | null
          permissions?: Json
          status?: "active" | "pending"
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
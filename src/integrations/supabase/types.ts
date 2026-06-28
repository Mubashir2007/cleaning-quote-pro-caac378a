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
      customers: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          postcode: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          postcode?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          postcode?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pricing_settings: {
        Row: {
          airbnb_base: number
          balcony: number
          carpet_cleaning: number
          created_at: string
          deep_base: number
          discount_pct: number
          end_of_tenancy_base: number
          extra_bathroom: number
          extra_bedroom: number
          extra_living_room: number
          fridge_cleaning: number
          garage: number
          inside_cabinets: number
          office_base: number
          oven_cleaning: number
          regular_base: number
          tax_pct: number
          updated_at: string
          user_id: string
          window_cleaning: number
        }
        Insert: {
          airbnb_base?: number
          balcony?: number
          carpet_cleaning?: number
          created_at?: string
          deep_base?: number
          discount_pct?: number
          end_of_tenancy_base?: number
          extra_bathroom?: number
          extra_bedroom?: number
          extra_living_room?: number
          fridge_cleaning?: number
          garage?: number
          inside_cabinets?: number
          office_base?: number
          oven_cleaning?: number
          regular_base?: number
          tax_pct?: number
          updated_at?: string
          user_id: string
          window_cleaning?: number
        }
        Update: {
          airbnb_base?: number
          balcony?: number
          carpet_cleaning?: number
          created_at?: string
          deep_base?: number
          discount_pct?: number
          end_of_tenancy_base?: number
          extra_bathroom?: number
          extra_bedroom?: number
          extra_living_room?: number
          fridge_cleaning?: number
          garage?: number
          inside_cabinets?: number
          office_base?: number
          oven_cleaning?: number
          regular_base?: number
          tax_pct?: number
          updated_at?: string
          user_id?: string
          window_cleaning?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          business_address: string | null
          company_logo_url: string | null
          company_name: string
          created_at: string
          currency: string
          default_notes: string | null
          email: string | null
          id: string
          phone: string | null
          terms_and_conditions: string | null
          updated_at: string
          vat_number: string | null
          website: string | null
        }
        Insert: {
          business_address?: string | null
          company_logo_url?: string | null
          company_name?: string
          created_at?: string
          currency?: string
          default_notes?: string | null
          email?: string | null
          id: string
          phone?: string | null
          terms_and_conditions?: string | null
          updated_at?: string
          vat_number?: string | null
          website?: string | null
        }
        Update: {
          business_address?: string | null
          company_logo_url?: string | null
          company_name?: string
          created_at?: string
          currency?: string
          default_notes?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          terms_and_conditions?: string | null
          updated_at?: string
          vat_number?: string | null
          website?: string | null
        }
        Relationships: []
      }
      quotes: {
        Row: {
          base_price: number
          bathroom_extra_total: number
          bathrooms: number
          bedroom_extra_total: number
          bedrooms: number
          cleaning_type: Database["public"]["Enums"]["cleaning_type"]
          created_at: string
          customer_id: string
          discount_amount: number
          extras: Json
          extras_total: number
          frequency: Database["public"]["Enums"]["frequency"]
          id: string
          living_room_total: number
          living_rooms: number
          notes: string | null
          quote_number: string
          square_footage: number | null
          status: Database["public"]["Enums"]["quote_status"]
          tax_amount: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          base_price?: number
          bathroom_extra_total?: number
          bathrooms?: number
          bedroom_extra_total?: number
          bedrooms?: number
          cleaning_type: Database["public"]["Enums"]["cleaning_type"]
          created_at?: string
          customer_id: string
          discount_amount?: number
          extras?: Json
          extras_total?: number
          frequency?: Database["public"]["Enums"]["frequency"]
          id?: string
          living_room_total?: number
          living_rooms?: number
          notes?: string | null
          quote_number?: string
          square_footage?: number | null
          status?: Database["public"]["Enums"]["quote_status"]
          tax_amount?: number
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          base_price?: number
          bathroom_extra_total?: number
          bathrooms?: number
          bedroom_extra_total?: number
          bedrooms?: number
          cleaning_type?: Database["public"]["Enums"]["cleaning_type"]
          created_at?: string
          customer_id?: string
          discount_amount?: number
          extras?: Json
          extras_total?: number
          frequency?: Database["public"]["Enums"]["frequency"]
          id?: string
          living_room_total?: number
          living_rooms?: number
          notes?: string | null
          quote_number?: string
          square_footage?: number | null
          status?: Database["public"]["Enums"]["quote_status"]
          tax_amount?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
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
      cleaning_type: "regular" | "deep" | "end_of_tenancy" | "office" | "airbnb"
      frequency: "one_time" | "weekly" | "fortnightly" | "monthly"
      quote_status: "pending" | "accepted" | "rejected" | "completed"
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
      cleaning_type: ["regular", "deep", "end_of_tenancy", "office", "airbnb"],
      frequency: ["one_time", "weekly", "fortnightly", "monthly"],
      quote_status: ["pending", "accepted", "rejected", "completed"],
    },
  },
} as const

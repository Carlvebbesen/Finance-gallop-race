export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      bets: {
        Row: {
          amount: number;
          asset: string;
          created_at: string;
          game: string;
          player: string;
          put_option_player: string | null;
          type: string;
        };
        Insert: {
          amount: number;
          asset: string;
          created_at?: string;
          game: string;
          player: string;
          put_option_player?: string | null;
          type: string;
        };
        Update: {
          amount?: number;
          asset?: string;
          created_at?: string;
          game?: string;
          player?: string;
          put_option_player?: string | null;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "Bets_game_fkey";
            columns: ["game"];
            isOneToOne: false;
            referencedRelation: "game";
            referencedColumns: ["game_id"];
          },
          {
            foreignKeyName: "Bets_player_fkey1";
            columns: ["player"];
            isOneToOne: false;
            referencedRelation: "player";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "Bets_put_option_player_fkey1";
            columns: ["put_option_player"];
            isOneToOne: false;
            referencedRelation: "player";
            referencedColumns: ["id"];
          }
        ];
      };
      game: {
        Row: {
          bonds_pos: number | null;
          call_base_amount: number;
          call_percent: number | null;
          created_at: string;
          created_by: string;
          crypto_pos: number | null;
          game_id: string;
          gold_pos: number | null;
          invest_multiplier: number;
          market_events: Json[];
          put_base_amount: number;
          put_percent: number | null;
          rounds: number;
          short_multiplier: number;
          state: string;
          stocks_pos: number | null;
        };
        Insert: {
          bonds_pos?: number | null;
          call_base_amount?: number;
          call_percent?: number | null;
          created_at?: string;
          created_by: string;
          crypto_pos?: number | null;
          game_id: string;
          gold_pos?: number | null;
          invest_multiplier?: number;
          market_events: Json[];
          put_base_amount?: number;
          put_percent?: number | null;
          rounds?: number;
          short_multiplier?: number;
          state?: string;
          stocks_pos?: number | null;
        };
        Update: {
          bonds_pos?: number | null;
          call_base_amount?: number;
          call_percent?: number | null;
          created_at?: string;
          created_by?: string;
          crypto_pos?: number | null;
          game_id?: string;
          gold_pos?: number | null;
          invest_multiplier?: number;
          market_events?: Json[];
          put_base_amount?: number;
          put_percent?: number | null;
          rounds?: number;
          short_multiplier?: number;
          state?: string;
          stocks_pos?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "Game_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "player";
            referencedColumns: ["id"];
          }
        ];
      };
      player: {
        Row: {
          created_at: string;
          id: string;
          nickname: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          nickname: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          nickname?: string;
        };
        Relationships: [];
      };
      player_in_game: {
        Row: {
          call_option_used: boolean | null;
          created_at: string;
          game_id: string;
          nickname: string | null;
          player_id: string;
          put_option_used: boolean | null;
        };
        Insert: {
          call_option_used?: boolean | null;
          created_at?: string;
          game_id: string;
          nickname?: string | null;
          player_id: string;
          put_option_used?: boolean | null;
        };
        Update: {
          call_option_used?: boolean | null;
          created_at?: string;
          game_id?: string;
          nickname?: string | null;
          player_id?: string;
          put_option_used?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "Player_in_game_game_id_fkey";
            columns: ["game_id"];
            isOneToOne: false;
            referencedRelation: "game";
            referencedColumns: ["game_id"];
          },
          {
            foreignKeyName: "Player_in_game_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "player";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;

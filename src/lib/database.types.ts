// Auto-generated Supabase database types.
// Run `supabase gen types typescript --project-id YOUR_PROJECT_ID` to regenerate.

export type PropertyType = "RESIDENTIAL" | "COMMERCIAL";
export type PropertyStatus = "READY_TO_MOVE" | "UNDER_CONSTRUCTION";
export type LeadStatus = "NEW" | "CONTACTED" | "NEGOTIATION" | "CONVERTED" | "LOST";
export type VisitStatus = "PENDING" | "APPROVED" | "COMPLETED" | "CANCELLED";

export interface Database {
  public: {
    Tables: {
      builders: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          description: string | null;
          established_year: number | null;
          total_projects: number | null;
          delivered_projects: number | null;
          website: string | null;
          phone: string | null;
          email: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["builders"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["builders"]["Insert"]>;
      };
      properties: {
        Row: {
          id: string;
          property_id: string;
          name: string;
          slug: string;
          type: PropertyType;
          status: PropertyStatus;
          builder_id: string | null;
          location: string;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          price: number;
          area_min: number | null;
          area_max: number | null;
          plot_size_sqft: number | null;
          facing: string | null;
          dimensions: string | null;
          approval_status: string | null;
          rera_number: string | null;
          available_units: number | null;
          configuration: string | null;
          description: string;
          amenities: string[];
          featured: boolean;
          views: number;
          seo_title: string | null;
          seo_description: string | null;
          seo_keywords: string | null;
          possession_year: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["properties"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["properties"]["Insert"]>;
      };
      property_images: {
        Row: {
          id: string;
          url: string;
          sort_order: number;
          image_type: "photo" | "floor_plan";
          property_id: string;
        };
        Insert: Omit<Database["public"]["Tables"]["property_images"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["property_images"]["Insert"]>;
      };
      documents: {
        Row: {
          id: string;
          name: string;
          url: string;
          type: string | null;
          property_id: string;
        };
        Insert: Omit<Database["public"]["Tables"]["documents"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["documents"]["Insert"]>;
      };
      nearby_places: {
        Row: {
          id: string;
          name: string;
          category: string;
          distance_km: number;
          property_id: string;
        };
        Insert: Omit<Database["public"]["Tables"]["nearby_places"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["nearby_places"]["Insert"]>;
      };
      property_videos: {
        Row: {
          id: string;
          title: string;
          youtube_url: string;
          property_id: string;
        };
        Insert: Omit<Database["public"]["Tables"]["property_videos"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["property_videos"]["Insert"]>;
      };
      leads: {
        Row: {
          id: string;
          name: string;
          mobile: string;
          email: string;
          message: string | null;
          status: LeadStatus;
          notes: string | null;
          follow_up_at: string | null;
          property_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["leads"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["leads"]["Insert"]>;
      };
      site_visits: {
        Row: {
          id: string;
          name: string;
          mobile: string | null;
          date: string;
          time_slot: string;
          status: VisitStatus;
          property_id: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["site_visits"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["site_visits"]["Insert"]>;
      };
      property_reviews: {
        Row: {
          id: string;
          property_id: string;
          name: string;
          rating: number;
          comment: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["property_reviews"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["property_reviews"]["Insert"]>;
      };
      property_views: {
        Row: {
          id: string;
          property_id: string;
          viewed_date: string;
        };
        Insert: Omit<Database["public"]["Tables"]["property_views"]["Row"], "id">;
        Update: never;
      };
      testimonials: {
        Row: {
          id: string;
          name: string;
          role: string;
          quote: string;
          rating: number;
          avatar_url: string | null;
          published: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["testimonials"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["testimonials"]["Insert"]>;
      };
      user_wishlist: {
        Row: {
          id: string;
          user_id: string;
          property_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          property_id: string;
          created_at?: string;
        };
        Update: never;
      };
      Views: Record<string, never>;
      Functions: Record<string, never>;
    };
  };
}

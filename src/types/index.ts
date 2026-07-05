import type { Database } from "@/lib/database.types";

export type PropertyType = "RESIDENTIAL" | "COMMERCIAL";
export type PropertyStatus = "READY_TO_MOVE" | "UNDER_CONSTRUCTION";
export type LeadStatus = "NEW" | "CONTACTED" | "NEGOTIATION" | "CONVERTED" | "LOST";
export type VisitStatus = "PENDING" | "APPROVED" | "COMPLETED" | "CANCELLED";

export type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
export type BuilderRow = Database["public"]["Tables"]["builders"]["Row"];
export type PropertyImageRow = Database["public"]["Tables"]["property_images"]["Row"];
export type DocumentRow = Database["public"]["Tables"]["documents"]["Row"];
export type NearbyPlaceRow = Database["public"]["Tables"]["nearby_places"]["Row"];
export type PropertyVideoRow = Database["public"]["Tables"]["property_videos"]["Row"];
export type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
export type SiteVisitRow = Database["public"]["Tables"]["site_visits"]["Row"];

export interface PropertyWithRelations extends PropertyRow {
  property_images: PropertyImageRow[];
  documents: DocumentRow[];
  nearby_places: NearbyPlaceRow[];
  property_videos: PropertyVideoRow[];
}

// Lightweight type used on card listings
export type PropertyCardData = Pick<
  PropertyWithRelations,
  | "id"
  | "property_id"
  | "name"
  | "slug"
  | "type"
  | "status"
  | "location"
  | "price"
  | "area_min"
  | "area_max"
  | "plot_size_sqft"
  | "facing"
  | "configuration"
  | "description"
  | "views"
  | "property_images"
>;

export interface PropertyFilters {
  q?: string;
  location?: string;
  type?: PropertyType;
  status?: PropertyStatus;
  maxPrice?: number;
  sort?: "latest" | "price-low" | "price-high" | "most-viewed";
  page?: number;
}

export interface LeadWithProperty extends LeadRow {
  properties: { name: string; property_id: string } | null;
}

export interface SiteVisitWithProperty extends SiteVisitRow {
  properties: { name: string } | null;
}

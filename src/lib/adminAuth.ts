import { supabase } from "@/lib/supabase";

/**
 * Check if a user is an admin by querying the Admin table in Supabase
 * This is more secure than relying on environment variable whitelists
 */
export async function isAdminUser(email: string | undefined): Promise<boolean> {
  if (!email) return false;

  try {
    const { data, error } = await supabase
      .from("admin")
      .select("id, active")
      .eq("email", email.toLowerCase())
      .eq("active", true)
      .single();

    if (error) {
      return false;
    }

    return !!data;
  } catch (err) {
    console.error("Admin authorization check failed:", err);
    return false;
  }
}

/**
 * Get admin details
 */
export async function getAdminDetails(email: string) {
  if (!email) return null;

  try {
    const { data, error } = await supabase
      .from("admin")
      .select("id, email, name, role, active")
      .eq("email", email.toLowerCase())
      .eq("active", true)
      .single();

    if (error) return null;
    return data as any;
  } catch (err) {
    console.error("Failed to fetch admin details:", err);
    return null;
  }
}

/**
 * Create a new admin (only for superadmin use)
 * In production, this should be called only from a trusted backend
 */
export async function createAdmin(email: string, name: string, role: "admin" | "superadmin" = "admin") {
  try {
    const { data, error } = await supabase
      .from("admin")
      .insert({
        email: email.toLowerCase(),
        name,
        role,
        active: true,
      } as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Failed to create admin:", err);
    throw err;
  }
}

/**
 * Deactivate an admin
 */
export async function deactivateAdmin(email: string) {
  try {
    const client = supabase as any;
    const result = await client
      .from("admin")
      .update({ active: false })
      .eq("email", email.toLowerCase());
    
    if (result.error) throw result.error;
    return true;
  } catch (err) {
    console.error("Failed to deactivate admin:", err);
    throw err;
  }
}

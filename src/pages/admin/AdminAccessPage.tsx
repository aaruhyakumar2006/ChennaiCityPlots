import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/App";
import { Mail, User, Plus, Trash2, Loader2, AlertCircle } from "lucide-react";

interface Admin {
  id: string;
  email: string;
  name: string;
  role: "admin" | "superadmin";
  active: boolean;
  createdAt: string;
}

export default function AdminAccessPage() {
  const { session } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "superadmin">("admin");
  const [submitting, setSubmitting] = useState(false);

  // Check if current user is superadmin
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    loadAdmins();
    checkSuperAdmin();
  }, [session]);

  async function checkSuperAdmin() {
    if (!session?.user.email) return;
    try {
      const { data, error: err } = await supabase
        .from("Admin")
        .select("role")
        .eq("email", session.user.email)
        .eq("active", true)
        .single();
      
      if (!err && (data as any)?.role === "superadmin") {
        setIsSuperAdmin(true);
      }
    } catch (err) {
      console.error("Error checking superadmin status:", err);
    }
  }

  async function loadAdmins() {
    setLoading(true);
    setError("");
    try {
      const { data, error: err } = await supabase
        .from("Admin")
        .select("id, email, name, role, active, createdAt")
        .order("createdAt", { ascending: false });

      if (err) throw err;
      setAdmins((data as any) || []);
    } catch (err) {
      setError("Failed to load admin users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function addAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail || !newName) return;
    
    setSubmitting(true);
    setError("");

    try {
      const { error: err } = await supabase
        .from("Admin")
        .insert({
          email: newEmail.toLowerCase(),
          name: newName,
          role: newRole,
          active: true,
        } as any);

      if (err) {
        if ((err as any).code === "23505") {
          setError("This email is already an admin");
        } else {
          setError(err.message || "Failed to add admin");
        }
      } else {
        setNewEmail("");
        setNewName("");
        setNewRole("admin");
        await loadAdmins();
      }
    } catch (err) {
      setError("An error occurred");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function removeAdmin(email: string) {
    if (!confirm(`Remove admin access for ${email}?`)) return;

    try {
      const client = supabase as any;
      const result = await client
        .from("Admin")
        .update({ active: false })
        .eq("email", email);

      if (result.error) throw result.error;
      await loadAdmins();
    } catch (err) {
      setError("Failed to remove admin");
      console.error(err);
    }
  }

  if (!isSuperAdmin) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
        <h2 className="font-bold text-red-900 mb-1">Access Denied</h2>
        <p className="text-sm text-red-700">
          Only superadmins can manage admin access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add new admin */}
      <div className="bg-white rounded-xl border border-line p-6">
        <h2 className="font-bold text-lg text-ink mb-4">Add New Admin</h2>
        <form onSubmit={addAdmin} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  required
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-line text-sm focus:border-accent focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  required
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Admin Name"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-line text-sm focus:border-accent focus:outline-none"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
              Role
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as "admin" | "superadmin")}
              className="w-full px-3 py-2.5 rounded-lg border border-line text-sm focus:border-accent focus:outline-none"
            >
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              ⚠ {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Adding…</>
            ) : (
              <><Plus className="w-4 h-4" /> Add Admin</>
            )}
          </button>
        </form>
      </div>

      {/* Admin list */}
      <div className="bg-white rounded-xl border border-line p-6">
        <h2 className="font-bold text-lg text-ink mb-4">Admin Users</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
          </div>
        ) : admins.length === 0 ? (
          <p className="text-center text-muted py-8">No admin users yet</p>
        ) : (
          <div className="space-y-2">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-line"
              >
                <div>
                  <p className="font-semibold text-sm text-ink">{admin.name}</p>
                  <p className="text-xs text-muted">{admin.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-semibold px-2 py-1 rounded bg-blue-100 text-blue-700">
                      {admin.role === "superadmin" ? "🔑 Superadmin" : "👤 Admin"}
                    </span>
                    {!admin.active && (
                      <span className="text-[11px] font-semibold px-2 py-1 rounded bg-red-100 text-red-700">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
                {admin.email !== session?.user.email && admin.active && (
                  <button
                    onClick={() => removeAdmin(admin.email)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-muted bg-slate-50 border border-line rounded-lg px-4 py-3">
        💡 <strong>Note:</strong> After adding an admin user here, they must sign up on the login page with their email address first. Once they create an account, their admin status will be automatically recognized and they can access the admin dashboard.
      </p>
    </div>
  );
}

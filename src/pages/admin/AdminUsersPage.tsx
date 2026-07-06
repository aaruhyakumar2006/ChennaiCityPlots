import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatDateShort } from "@/lib/format";
import { Search, Download, UserCheck, AlertCircle, Database, Copy, Check } from "lucide-react";

interface RegisteredUser {
  id: string;
  email: string;
  full_name: string;
  mobile: string;
  created_at: string;
  last_sign_in_at: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [errorType, setErrorType] = useState<"none" | "rpc_missing" | "other">("none");
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedSql, setCopiedSql] = useState(false);

  const SQL_HELPER = `-- ============================================================
-- RUN THIS IN YOUR SUPABASE SQL EDITOR TO ENABLE THE USER LIST
-- ============================================================

CREATE OR REPLACE FUNCTION get_users_list()
RETURNS TABLE (
  id UUID,
  email VARCHAR,
  full_name TEXT,
  mobile TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow authenticated users to query this list
  IF auth.role() != 'authenticated' THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', ''),
    COALESCE(u.raw_user_meta_data->>'mobile', ''),
    u.created_at,
    u.last_sign_in_at
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_users_list() TO authenticated;`;

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setErrorType("none");
    setErrorMessage("");

    try {
      const { data, error } = await supabase.rpc("get_users_list");

      if (error) {
        // If the function is not found or database lacks RPC privileges
        if (
          error.code === "PGRST202" || 
          error.message?.includes("get_users_list") || 
          error.message?.includes("function")
        ) {
          setErrorType("rpc_missing");
        } else {
          setErrorType("other");
          setErrorMessage(error.message);
        }
      } else {
        setUsers((data as RegisteredUser[]) ?? []);
      }
    } catch (err: any) {
      setErrorType("other");
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopySql() {
    navigator.clipboard.writeText(SQL_HELPER);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  }

  function handleExportCsv() {
    if (users.length === 0) return;

    // Header row
    const headers = ["User ID", "Full Name", "Email Address", "Mobile", "Signed Up At", "Last Login At"];
    
    // Data rows
    const rows = users.map((u) => [
      u.id,
      u.full_name || "—",
      u.email,
      u.mobile || "—",
      u.created_at ? new Date(u.created_at).toLocaleString() : "—",
      u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : "—"
    ]);

    // Construct CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((val) => `"${val.replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    // Download trigger
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `registered_users_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Filter users by search term
  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(term) ||
      u.full_name.toLowerCase().includes(term) ||
      u.mobile.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-10 h-10 rounded-full border-3 border-accent border-t-transparent animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Fetching registered users…</p>
      </div>
    );
  }

  // Setup instructions if RPC function does not exist
  if (errorType === "rpc_missing") {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 flex items-start gap-4">
          <div className="p-3 bg-amber-100 text-amber-800 rounded-xl shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-amber-950 text-lg mb-1">Database Setup Required</h3>
            <p className="text-sm text-amber-800 leading-relaxed">
              To query registered users directly from Supabase Auth securely, you must create a custom database helper function. Standard API keys do not have permission to browse user records without this.
            </p>
          </div>
        </div>

        <div className="bg-white border border-line rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-line flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-accent" />
              <h4 className="font-display font-semibold text-ink">Setup Instructions</h4>
            </div>
            <button
              onClick={handleCopySql}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line text-xs font-semibold text-ink-700 bg-surface hover:bg-slate-50 transition active:scale-95"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy SQL
                </>
              )}
            </button>
          </div>

          <div className="p-6 space-y-5">
            <ol className="list-decimal pl-5 text-sm text-muted space-y-2">
              <li>Open your <strong>Supabase Project Dashboard</strong>.</li>
              <li>Navigate to the <strong>SQL Editor</strong> menu on the left sidebar.</li>
              <li>Click <strong>New Query</strong>.</li>
              <li>Paste the SQL script below and click the <strong>Run</strong> button.</li>
              <li>Once done, return here and refresh the page!</li>
            </ol>

            <div className="relative">
              <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs font-mono overflow-x-auto max-h-[300px] leading-relaxed">
                {SQL_HELPER}
              </pre>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={fetchUsers}
                className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-accent text-white hover:opacity-90 transition active:scale-95"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Other error state
  if (errorType === "other") {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="font-display font-bold text-ink text-lg mb-2">Failed to Load Users</h3>
        <p className="text-sm text-muted mb-6">{errorMessage}</p>
        <button
          onClick={fetchUsers}
          className="px-5 py-2.5 rounded-xl border border-line bg-white hover:bg-slate-50 transition text-sm font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Registered Accounts", value: users.length, icon: UserCheck, color: "text-accent bg-accent/8" },
          { label: "Active Recently (Last 7 Days)", value: users.filter(u => u.last_sign_in_at && (Date.now() - new Date(u.last_sign_in_at).getTime()) < 7 * 24 * 60 * 60 * 1000).length, icon: UserCheck, color: "text-green-600 bg-green-50" },
          { label: "New Registrations (Last 30 Days)", value: users.filter(u => u.created_at && (Date.now() - new Date(u.created_at).getTime()) < 30 * 24 * 60 * 60 * 1000).length, icon: UserCheck, color: "text-blue-600 bg-blue-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-line p-5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-2xl font-display font-bold text-ink">{stat.value}</p>
              <p className="text-xs text-muted mt-1">{stat.label}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-line rounded-2xl shadow-sm overflow-hidden">
        {/* Controls Header */}
        <div className="px-6 py-4 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or mobile…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-line rounded-xl text-sm focus:border-accent focus:outline-none"
            />
          </div>
          <button
            onClick={handleExportCsv}
            disabled={filteredUsers.length === 0}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-line bg-surface hover:bg-slate-50 transition font-semibold text-sm text-ink-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export to CSV
          </button>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          {filteredUsers.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-line text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Full Name</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Mobile</th>
                  <th className="px-6 py-3.5">Sign Up Date</th>
                  <th className="px-6 py-3.5">Last Login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-sm text-ink-700">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-semibold text-ink">
                      {u.full_name || <span className="text-gray-400 font-normal">No name provided</span>}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{u.email}</td>
                    <td className="px-6 py-4">
                      {u.mobile ? <span className="font-mono text-xs">{u.mobile}</span> : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {u.created_at ? formatDateShort(u.created_at) : "—"}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {u.last_sign_in_at ? formatDateShort(u.last_sign_in_at) : <span className="text-gray-400 italic text-xs">Never</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-16 text-center">
              <p className="text-slate-400 font-medium">No registered users matched your search criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Star, Eye, EyeOff, Loader2, X } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  avatar_url: string | null;
  published: boolean;
  created_at: string;
}

const BLANK = { name: "", role: "", quote: "", rating: 5, avatar_url: "" };

export default function AdminTestimonialsPage() {
  const [items, setItems]     = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState(BLANK);
  const [saving, setSaving]   = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    const { data, error } = await (supabase as any)
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      setError("Failed to load reviews. Please refresh.");
    }
    setItems((data as Testimonial[]) ?? []);
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.quote.trim() || !form.role.trim()) {
      setError("Name, role and quote are required."); return;
    }
    setSaving(true); setError("");
    const { data, error: err } = await (supabase as any)
      .from("testimonials")
      .insert({ ...form, avatar_url: form.avatar_url || null, published: true })
      .select()
      .single();
    setSaving(false);
    if (err) { setError(err.message); return; }
    setItems((prev) => [data as Testimonial, ...prev]);
    setForm(BLANK);
    setShowForm(false);
  }

  async function togglePublished(id: string, current: boolean) {
    // Optimistic update
    setItems((prev) => prev.map((t) => t.id === id ? { ...t, published: !current } : t));
    const { error } = await (supabase as any).from("testimonials").update({ published: !current }).eq("id", id);
    if (error) {
      // Revert on failure
      setItems((prev) => prev.map((t) => t.id === id ? { ...t, published: current } : t));
      setError("Failed to update publish status: " + error.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this review?")) return;
    const snapshot = items;
    setItems((prev) => prev.filter((t) => t.id !== id));
    const { error } = await (supabase as any).from("testimonials").delete().eq("id", id);
    if (error) {
      setItems(snapshot);
      setError("Failed to delete review: " + error.message);
    }
  }

  const inputCls = "w-full px-3.5 py-2.5 rounded-xl2 border border-line text-sm focus:border-accent focus:outline-none";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{items.length} review{items.length !== 1 ? "s" : ""}</p>
        <button
          onClick={() => { setShowForm((s) => !s); setError(""); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl2 bg-accent text-white text-sm font-semibold hover:bg-accent-700 transition"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "Add Review"}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-xl2 border border-line p-6 space-y-4">
          <p className="font-display font-semibold">New Review</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink-700">Customer Name *</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="Karthik S." />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink-700">Role / Purchase *</label>
              <input value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className={inputCls} placeholder="Bought a 3BHK in OMR" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-ink-700">Review *</label>
            <textarea value={form.quote} onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))} className={`${inputCls} min-h-[80px] resize-y`} placeholder="Share the customer's experience…" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink-700">Rating</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map((n) => (
                  <button key={n} type="button" onClick={() => setForm((f) => ({ ...f, rating: n }))}>
                    <Star className={`w-5 h-5 transition ${n <= form.rating ? "fill-amber-400 text-amber-400" : "text-line"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink-700">Avatar URL (optional)</label>
              <input value={form.avatar_url} onChange={(e) => setForm((f) => ({ ...f, avatar_url: e.target.value }))} className={inputCls} placeholder="https://…" />
            </div>
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl2 px-4 py-2">{error}</p>}
          <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl2 bg-accent text-white text-sm font-semibold hover:bg-accent-700 transition disabled:opacity-60 flex items-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? "Saving…" : "Add Review"}
          </button>
        </form>
      )}

      {/* List */}
      <div className="bg-white rounded-xl2 border border-line overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-muted animate-pulse">Loading reviews…</div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-muted">No reviews yet — add one above.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs text-muted uppercase">
              <tr>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Review</th>
                <th className="px-5 py-3 font-semibold">Rating</th>
                <th className="px-5 py-3 font-semibold">Published</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-t border-line hover:bg-surface/60">
                  <td className="px-5 py-3.5">
                    <p className="font-medium">{t.name}</p>
                    <p className="text-xs text-muted">{t.role}</p>
                  </td>
                  <td className="px-5 py-3.5 text-muted max-w-xs">
                    <p className="line-clamp-2">{t.quote}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((n) => (
                        <Star key={n} className={`w-3.5 h-3.5 ${n <= t.rating ? "fill-amber-400 text-amber-400" : "text-line"}`} />
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => togglePublished(t.id, t.published)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition ${t.published ? "bg-ok/10 text-ok" : "bg-surface text-muted"}`}
                    >
                      {t.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      {t.published ? "Live" : "Hidden"}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center ml-auto"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

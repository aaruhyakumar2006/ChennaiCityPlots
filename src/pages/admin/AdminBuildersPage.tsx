import { useEffect, useState, useRef } from "react";
import { X, Plus, Loader2, Trash2, Pencil } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { BuilderRow } from "@/types";

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

interface FormState {
  name: string; slug: string; logo_url: string; description: string;
  established_year: string; total_projects: string; delivered_projects: string;
  website: string; phone: string; email: string;
}

const BLANK: FormState = {
  name: "", slug: "", logo_url: "", description: "", established_year: "",
  total_projects: "", delivered_projects: "", website: "", phone: "", email: "",
};

function rowToForm(b: BuilderRow): FormState {
  return {
    name: b.name, slug: b.slug, logo_url: b.logo_url ?? "", description: b.description ?? "",
    established_year: b.established_year != null ? String(b.established_year) : "",
    total_projects: b.total_projects != null ? String(b.total_projects) : "",
    delivered_projects: b.delivered_projects != null ? String(b.delivered_projects) : "",
    website: b.website ?? "", phone: b.phone ?? "", email: b.email ?? "",
  };
}

const inputCls = "w-full px-3.5 py-2.5 rounded-xl2 border border-line text-sm focus:border-accent focus:outline-none bg-white";

function BuilderModal({ builder, onClose, onSaved }: { builder?: BuilderRow; onClose: () => void; onSaved: (b: BuilderRow) => void }) {
  const isEdit = !!builder;
  const [form, setForm] = useState<FormState>(() => builder ? rowToForm(builder) : BLANK);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isEdit) setForm((f) => ({ ...f, slug: slugify(f.name) }));
  }, [form.name, isEdit]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  function set(k: keyof FormState, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required."); return; }
    setError(""); setSaving(true);
    const payload = {
      name: form.name.trim(), slug: form.slug.trim() || slugify(form.name),
      logo_url: form.logo_url.trim() || null, description: form.description.trim() || null,
      established_year: form.established_year ? Number(form.established_year) : null,
      total_projects: form.total_projects ? Number(form.total_projects) : null,
      delivered_projects: form.delivered_projects ? Number(form.delivered_projects) : null,
      website: form.website.trim() || null, phone: form.phone.trim() || null, email: form.email.trim() || null,
    };
    const q = isEdit
      ? (supabase.from("builders") as any).update(payload).eq("id", builder!.id).select().single()
      : (supabase.from("builders") as any).insert(payload).select().single();
    const { data, error: err } = await q;
    setSaving(false);
    if (err) { setError(err.message); return; }
    onSaved(data as BuilderRow);
  }

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="bg-white rounded-xl3 shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line shrink-0">
          <h2 className="font-display font-bold text-lg">{isEdit ? "Edit Builder" : "Add Builder"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-surface flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <form id="builder-form" onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 col-span-2">
              <span className="text-xs font-semibold">Builder / Developer Name *</span>
              <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Prestige Group" required />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold">URL Slug</span>
              <input className={inputCls} value={form.slug} onChange={(e) => set("slug", slugify(e.target.value))} placeholder="auto-generated" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold">Established Year</span>
              <input type="number" className={inputCls} value={form.established_year} onChange={(e) => set("established_year", e.target.value)} placeholder="e.g. 2005" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold">Total Projects</span>
              <input type="number" className={inputCls} value={form.total_projects} onChange={(e) => set("total_projects", e.target.value)} placeholder="e.g. 40" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold">Delivered Projects</span>
              <input type="number" className={inputCls} value={form.delivered_projects} onChange={(e) => set("delivered_projects", e.target.value)} placeholder="e.g. 35" />
            </label>
            <label className="flex flex-col gap-1.5 col-span-2">
              <span className="text-xs font-semibold">Logo URL</span>
              <input className={inputCls} value={form.logo_url} onChange={(e) => set("logo_url", e.target.value)} placeholder="https://…" />
            </label>
            <label className="flex flex-col gap-1.5 col-span-2">
              <span className="text-xs font-semibold">Description</span>
              <textarea className={`${inputCls} min-h-[80px] resize-y`} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Brief about the builder…" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold">Phone</span>
              <input className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765 43210" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold">Email</span>
              <input type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="info@builder.com" />
            </label>
            <label className="flex flex-col gap-1.5 col-span-2">
              <span className="text-xs font-semibold">Website</span>
              <input className={inputCls} value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://builder.com" />
            </label>
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl2 px-4 py-3">{error}</p>}
        </form>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-line shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl2 border border-line text-sm font-semibold hover:border-accent transition">Cancel</button>
          <button form="builder-form" type="submit" disabled={saving} className="px-5 py-2 rounded-xl2 bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition disabled:opacity-60 flex items-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Builder"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminBuildersPage() {
  const [builders, setBuilders] = useState<BuilderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BuilderRow | undefined>(undefined);

  useEffect(() => {
    supabase.from("builders" as any).select("*").order("name", { ascending: true })
      .then(({ data }) => { setBuilders((data as BuilderRow[]) ?? []); setLoading(false); });
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this builder? Properties linked to them will have no builder.")) return;
    await (supabase.from("builders") as any).delete().eq("id", id);
    setBuilders((prev) => prev.filter((b) => b.id !== id));
  }

  function handleSaved(b: BuilderRow) {
    setBuilders((prev) => editing ? prev.map((x) => x.id === b.id ? b : x) : [b, ...prev]);
    setModalOpen(false);
  }

  return (
    <>
      <div className="bg-white rounded-xl2 border border-line overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <p className="text-sm text-muted">{builders.length} builders</p>
          <button onClick={() => { setEditing(undefined); setModalOpen(true); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl2 bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition">
            <Plus className="w-4 h-4" /> Add Builder
          </button>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-muted animate-pulse">Loading builders…</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-surface text-left text-xs text-muted uppercase">
                <tr>
                  <th className="px-5 py-3 font-semibold">Builder</th>
                  <th className="px-5 py-3 font-semibold">Est.</th>
                  <th className="px-5 py-3 font-semibold">Projects</th>
                  <th className="px-5 py-3 font-semibold">Delivered</th>
                  <th className="px-5 py-3 font-semibold">Contact</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {builders.map((b) => (
                  <tr key={b.id} className="border-t border-line hover:bg-surface/60">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {b.logo_url ? (
                          <img src={b.logo_url} alt={b.name} className="w-8 h-8 rounded-lg object-contain border border-line" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-accent-50 flex items-center justify-center text-accent font-bold text-sm">{b.name.charAt(0)}</div>
                        )}
                        <div>
                          <p className="font-medium">{b.name}</p>
                          <p className="text-xs text-muted">/builders/{b.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted">{b.established_year ?? "—"}</td>
                    <td className="px-5 py-3.5 text-muted">{b.total_projects ?? "—"}</td>
                    <td className="px-5 py-3.5 text-muted">{b.delivered_projects ?? "—"}</td>
                    <td className="px-5 py-3.5 text-muted text-xs">{b.phone ?? b.email ?? "—"}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setEditing(b); setModalOpen(true); }}
                          className="w-8 h-8 rounded-xl2 border border-line flex items-center justify-center hover:border-accent hover:text-accent transition">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(b.id)}
                          className="w-8 h-8 rounded-xl2 border border-line flex items-center justify-center hover:border-red-400 hover:text-red-500 transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {builders.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-muted">No builders yet — click "Add Builder" to create one.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {modalOpen && <BuilderModal builder={editing} onClose={() => setModalOpen(false)} onSaved={handleSaved} />}
    </>
  );
}

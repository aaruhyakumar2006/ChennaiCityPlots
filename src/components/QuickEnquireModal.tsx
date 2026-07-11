import { useState, useRef } from "react";
import { X, Loader2, Send, User, Phone, Mail, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Props {
  propertyId: string;
  propertyName: string;
  onClose: () => void;
}

function FloatInput({
  name, type = "text", label, icon: Icon, required, pattern,
}: {
  name: string; type?: string; label: string; icon: React.ElementType; required?: boolean; pattern?: string;
}) {
  return (
    <div className="input-float-group">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <input name={name} type={type} required={required} pattern={pattern}
        placeholder=" " className="input-float pl-10" />
      <label className="input-float-label pl-10">{label}</label>
    </div>
  );
}

export default function QuickEnquireModal({ propertyId, propertyName, onClose }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError]   = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(""); setStatus("loading");
    const fd = new FormData(e.currentTarget);
    const { data: lead, error: err } = await (supabase.from("leads") as ReturnType<typeof supabase.from>).insert({
      name: fd.get("name") as string, mobile: fd.get("mobile") as string,
      email: fd.get("email") as string, message: `Quick enquiry for: ${propertyName}`,
      property_id: propertyId, status: "NEW",
    } as never).select().single();
    if (err) { setError(err.message); setStatus("idle"); return; }

    // Fire-and-forget — notify admin
    supabase.functions.invoke("notify-lead", { body: { record: lead } }).catch(() => {});

    setStatus("done");
  }

  return (
    <div ref={overlayRef} onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-fadeDown overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #1D4ED8 0%, #1E3A8A 100%)" }}>
          <div>
            <p className="font-display font-bold text-white text-sm">Quick Enquiry</p>
            <p className="text-blue-200 text-xs line-clamp-1 mt-0.5">{propertyName}</p>
          </div>
          <button onClick={onClose} aria-label="Close"
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="px-6 py-5">
          {status === "done" ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-blue-500" />
              </div>
              <p className="font-display font-bold text-base mb-1">Enquiry Sent!</p>
              <p className="text-sm text-muted mb-5">We'll call you within 24 hours.</p>
              <button onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition">
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <FloatInput name="name"   label="Full Name"      icon={User}  required />
              <FloatInput name="mobile" label="Mobile Number"  icon={Phone} required type="tel" pattern="[6-9][0-9]{9}" />
              <FloatInput name="email"  label="Email Address"  icon={Mail}  required type="email" />
              {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}
              <button type="submit" disabled={status === "loading"}
                className="w-full py-3.5 rounded-xl text-white font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2 transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #1D4ED8 0%, #1E3A8A 100%)", boxShadow: "0 4px 16px rgba(29,78,216,0.3)" }}>
                {status === "loading" ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><Send className="w-4 h-4" /> Send Enquiry</>}
              </button>
              <p className="text-[11px] text-slate-400 text-center">🔒 100% confidential</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

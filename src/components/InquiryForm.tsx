import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, Loader2, Send, User, Phone, Mail, MessageSquare } from "lucide-react";

function FloatInput({
  name, type = "text", label, icon: Icon, required, pattern, autoComplete,
}: {
  name: string; type?: string; label: string;
  icon: React.ElementType; required?: boolean; pattern?: string; autoComplete?: string;
}) {
  return (
    <div className="input-float-group">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <input
        name={name}
        type={type}
        required={required}
        pattern={pattern}
        autoComplete={autoComplete}
        placeholder=" "
        className="input-float pl-10"
      />
      <label className="input-float-label pl-10">{label}</label>
    </div>
  );
}

export default function InquiryForm({ propertyId }: { propertyId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as {
      name: string; mobile: string; email: string; message?: string;
    };
    const { data: lead, error } = await (supabase.from("leads") as ReturnType<typeof supabase.from>).insert({
      name: data.name, mobile: data.mobile, email: data.email,
      message: data.message || null, property_id: propertyId, status: "NEW",
    } as never).select().single();
    if (error) { setStatus("error"); setErrorMsg(error.message); return; }

    // Fire-and-forget — notify admin via Edge Function
    supabase.functions.invoke("notify-lead", { body: { record: lead } }).catch(() => {});

    setStatus("done");
    form.reset();
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-7 text-center shadow-sm">
        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-7 h-7 text-blue-500" />
        </div>
        <p className="font-display font-bold text-lg mb-1 text-blue-800">Enquiry Submitted!</p>
        <p className="text-sm text-blue-700/80 mb-5">Our relationship manager will call you within 24 hours.</p>
        <button onClick={() => setStatus("idle")}
          className="text-sm font-semibold text-blue-700 hover:text-blue-800 underline underline-offset-2">
          Submit another enquiry
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-white shadow-soft overflow-hidden">
      {/* Header strip */}
      <div className="px-6 py-4" style={{ background: "linear-gradient(135deg, #1D4ED8 0%, #1E3A8A 100%)" }}>
        <h3 className="font-display font-bold text-white text-base mb-0.5">Interested in this property?</h3>
        <p className="text-blue-200 text-xs">Get a free callback within 24 hours</p>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-3">
        <FloatInput name="name" label="Full Name" icon={User} required autoComplete="name" />
        <FloatInput name="mobile" type="tel" label="Mobile Number" icon={Phone} required pattern="[6-9][0-9]{9}" autoComplete="tel" />
        <FloatInput name="email" type="email" label="Email Address" icon={Mail} required autoComplete="email" />

        {/* Textarea with floating label */}
        <div className="input-float-group">
          <div className="absolute left-3.5 top-5 pointer-events-none z-10">
            <MessageSquare className="w-4 h-4 text-slate-400" />
          </div>
          <textarea name="message" rows={3} placeholder=" " className="input-float-ta pl-10" />
          <label className="input-float-label-ta pl-10">Message (optional)</label>
        </div>

        {status === "error" && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{errorMsg}</p>
        )}

        <button type="submit" disabled={status === "loading"}
          className="w-full py-3.5 rounded-xl text-white font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2 transition hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #1D4ED8 0%, #1E3A8A 100%)", boxShadow: "0 4px 16px rgba(29,78,216,0.35)" }}>
          {status === "loading"
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
            : <><Send className="w-4 h-4" /> Send Enquiry</>}
        </button>

        <p className="text-[11px] text-slate-400 text-center">🔒 Your details are 100% confidential</p>
      </form>
    </div>
  );
}

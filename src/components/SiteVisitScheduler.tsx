import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatDateShort } from "@/lib/format";
import { CalendarDays, Clock, CheckCircle2, Loader2, User, Phone } from "lucide-react";

const ALL_TIME_SLOTS = ["10:00 AM", "11:30 AM", "2:00 PM", "4:30 PM"];

function slotHour(slot: string): number {
  const [time, meridiem] = slot.split(" ");
  let [h] = time.split(":").map(Number);
  if (meridiem === "PM" && h !== 12) h += 12;
  if (meridiem === "AM" && h === 12) h = 0;
  return h;
}

export default function SiteVisitScheduler({ propertyId }: { propertyId: string }) {
  const [name, setName]     = useState("");
  const [mobile, setMobile] = useState("");
  const [date, setDate]     = useState("");
  const [slot, setSlot]     = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const nowHour = new Date().getHours();

  // Sunday = day 0 — office closed
  const isSunday = (d: string) => d ? new Date(d + "T00:00:00").getDay() === 0 : false;

  // If date is today, filter out slots that have already passed
  const availableSlots = ALL_TIME_SLOTS.filter((s) => {
    if (date !== today) return true;
    return slotHour(s) > nowHour;
  });

  async function confirmVisit() {
    if (!name.trim())          { setStatus("error"); setErrorMsg("Please enter your name."); return; }
    if (!mobile.trim() || !/^[0-9]{10}$/.test(mobile.trim())) {
      setStatus("error"); setErrorMsg("Enter a valid 10-digit mobile number."); return;
    }
    if (!date || !slot)        { setStatus("error"); setErrorMsg("Pick a date and time slot."); return; }
    if (isSunday(date))        { setStatus("error"); setErrorMsg("We're closed on Sundays. Please pick a weekday."); return; }
    setStatus("loading");
    const { error } = await (supabase.from("site_visits") as ReturnType<typeof supabase.from>).insert({
      name: name.trim(), mobile: mobile.trim(), date, time_slot: slot,
      property_id: propertyId, status: "PENDING",
    } as never);
    if (error) { setStatus("error"); setErrorMsg(error.message); return; }
    setStatus("done");
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-7 text-center shadow-sm">
        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-7 h-7 text-blue-600" />
        </div>
        <p className="font-display font-bold text-lg mb-1 text-blue-950">Visit Requested!</p>
        <p className="text-sm text-blue-700/80 mb-1">
          <span className="font-semibold">{formatDateShort(date)}</span> at <span className="font-semibold">{slot}</span>
        </p>
        <p className="text-xs text-blue-600/70">Our team will confirm your visit shortly.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-white shadow-soft overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 flex items-center gap-3"
        style={{ background: "linear-gradient(135deg, #1D4ED8 0%, #1E3A8A 100%)" }}>
        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
          <CalendarDays className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-display font-bold text-white text-base leading-tight">Schedule a Site Visit</h3>
          <p className="text-blue-200 text-xs">Free guided visit with our team</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Name */}
        <div className="input-float-group">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <User className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder=" " className="input-float pl-10" />
          <label className="input-float-label pl-10">Your Name</label>
        </div>

        {/* Mobile */}
        <div className="input-float-group">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <Phone className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)}
            pattern="[0-9]{10}" maxLength={10}
            placeholder=" " className="input-float pl-10" />
          <label className="input-float-label pl-10">Mobile Number</label>
        </div>

        {/* Date picker */}
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <CalendarDays className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="date"
            value={date}
            min={today}
            onChange={(e) => { setDate(e.target.value); setSlot(null); }}
            className="w-full pl-10 pr-4 py-3 rounded-xl border-[1.5px] border-line text-sm focus:border-accent focus:outline-none bg-white text-ink"
          />
          {isSunday(date) && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 mt-1">
              Sundays are closed. Please choose Mon–Sat.
            </p>
          )}
        </div>

        {/* Time slots */}
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2.5 uppercase tracking-wide">
            <Clock className="w-3.5 h-3.5" /> Choose a time slot
          </p>
          {availableSlots.length === 0 ? (
            <p className="text-xs text-muted bg-surface rounded-xl px-3 py-2.5">
              No slots available for today. Please pick a future date.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {availableSlots.map((t) => (
                <button key={t} type="button" onClick={() => { setSlot(t); setStatus("idle"); }}
                  className={`py-2.5 rounded-xl border-[1.5px] text-xs font-semibold transition-all ${
                    slot === t
                      ? "border-accent bg-accent/8 text-accent shadow-sm"
                      : "border-line text-slate-500 hover:border-accent/50 hover:text-accent"
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {status === "error" && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{errorMsg}</p>
        )}

        <button onClick={confirmVisit} disabled={status === "loading"}
          className="w-full py-3.5 rounded-xl font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2 transition-all"
          style={{
            background: slot && date && name && mobile
              ? "linear-gradient(135deg, #1D4ED8 0%, #1E3A8A 100%)"
              : "#E2E8F0",
            color: slot && date && name && mobile ? "white" : "#94A3B8",
            boxShadow: slot && date && name && mobile ? "0 4px 16px rgba(29,78,216,0.3)" : "none",
          }}>
          {status === "loading"
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
            : <><CalendarDays className="w-4 h-4" /> Confirm Visit Request</>}
        </button>

        <p className="text-[11px] text-slate-400 text-center">Free visit • No obligation • Our team accompanies you</p>
      </div>
    </div>
  );
}

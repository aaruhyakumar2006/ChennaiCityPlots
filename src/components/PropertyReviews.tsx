import { useEffect, useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface Props {
  propertyId: string;
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type={onChange ? "button" : undefined}
          onClick={() => onChange?.(s)}
          onMouseEnter={() => onChange && setHovered(s)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? "cursor-pointer" : "cursor-default pointer-events-none"}
          aria-label={onChange ? `Rate ${s} star${s > 1 ? "s" : ""}` : undefined}
        >
          <Star
            className={`w-5 h-5 transition ${
              s <= (hovered || value) ? "fill-amber-400 text-amber-400" : "text-line"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function PropertyReviews({ propertyId }: Props) {
  const [reviews, setReviews]   = useState<Review[]>([]);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]       = useState("");

  const [name,    setName]    = useState("");
  const [rating,  setRating]  = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    (supabase as any)
      .from("property_reviews")
      .select("id, name, rating, comment, created_at")
      .eq("property_id", propertyId)
      .order("created_at", { ascending: false })
      .then(({ data, error }: any) => {
        if (error) setError("Failed to load reviews.");
        setReviews((data as Review[]) ?? []);
        setLoading(false);
      });
  }, [propertyId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) { setError("Name and comment are required."); return; }
    setError("");
    setSubmitting(true);
    const { data, error: err } = await (supabase.from("property_reviews") as any)
      .insert({ property_id: propertyId, name: name.trim(), rating, comment: comment.trim() })
      .select()
      .single();
    setSubmitting(false);
    if (err) { setError("Failed to submit review. Please try again."); return; }
    setReviews((prev) => [data as Review, ...prev]);
    setName(""); setRating(5); setComment("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  }

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const inputCls = "w-full px-3.5 py-2.5 rounded-xl2 border border-line text-sm focus:border-accent focus:outline-none";

  return (
    <div>
      {/* Summary */}
      <div className="flex items-center gap-4 mb-8">
        <h2 className="font-display font-semibold text-xl">Reviews</h2>
        {avgRating && (
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-2xl text-amber-500">{avgRating}</span>
            <StarRating value={Math.round(Number(avgRating))} />
            <span className="text-sm text-muted">({reviews.length})</span>
          </div>
        )}
      </div>

      {/* Review form */}
      <form
        onSubmit={handleSubmit}
        className="bg-surface rounded-xl2 p-5 mb-8 border border-line space-y-4"
      >
        <p className="text-sm font-semibold text-ink">Write a Review</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-ink-700">Your Name <span className="text-red-500">*</span></label>
            <input
              className={inputCls}
              placeholder="e.g. Karthik S."
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-ink-700">Rating</label>
            <div className="h-10 flex items-center">
              <StarRating value={rating} onChange={setRating} />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-ink-700">Your Review <span className="text-red-500">*</span></label>
          <textarea
            className={`${inputCls} min-h-[80px] resize-y`}
            placeholder="Share your experience with this property…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={600}
          />
        </div>
        {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl2 px-3 py-2">{error}</p>}
        {submitted && <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl2 px-3 py-2">Thanks for your review!</p>}
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl2 bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition disabled:opacity-60"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? "Submitting…" : "Submit Review"}
        </button>
      </form>

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-20 bg-surface rounded-xl2 animate-pulse" />)}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted text-center py-8 border border-dashed border-line rounded-xl2">
          No reviews yet — be the first to review this property.
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white border border-line rounded-xl2 px-5 py-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent-50 flex items-center justify-center text-accent font-display font-bold text-sm shrink-0">
                    {r.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{r.name}</p>
                    <p className="text-[11px] text-muted">
                      {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <StarRating value={r.rating} />
              </div>
              <p className="text-sm text-muted leading-relaxed">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

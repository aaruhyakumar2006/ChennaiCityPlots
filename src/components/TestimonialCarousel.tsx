import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  avatar_url: string | null;
}

const FALLBACK: Testimonial[] = [
  {
    id: "1",
    name: "Karthik Subramaniam",
    role: "Bought a plot in OMR",
    quote: "The whole process felt transparent from day one — pricing, paperwork, everything was laid out clearly before we paid a rupee.",
    rating: 5,
    avatar_url: null,
  },
  {
    id: "2",
    name: "Anitha Raghavan",
    role: "Bought a plot in Sholinganallur",
    quote: "Our relationship manager coordinated every site visit and handled the legal team on our behalf. Made a stressful process feel manageable.",
    rating: 5,
    avatar_url: null,
  },
  {
    id: "3",
    name: "Suresh Kumar",
    role: "Invested in a commercial plot, Guindy",
    quote: "Madras City Plots was the only broker with DTCP and CMDA verified listings. That trust made all the difference.",
    rating: 5,
    avatar_url: null,
  },
];

export default function TestimonialCarousel() {
  const [items, setItems]   = useState<Testimonial[]>(FALLBACK);
  const [idx, setIdx]       = useState(0);

  useEffect(() => {
    supabase
      .from("testimonials")
      .select("id, name, role, quote, rating, avatar_url")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) setItems(data as Testimonial[]);
      });
  }, []);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 6000);
    return () => clearInterval(t);
  }, [items.length]);

  const move = (dir: number) => setIdx((i) => (i + dir + items.length) % items.length);
  const t = items[idx];

  return (
    <div className="relative bg-surface rounded-xl3 p-8 md:p-12 overflow-hidden">
      <Quote className="w-10 h-10 text-accent/20 mb-4" />

      {/* Stars */}
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < t.rating ? "fill-amber-400 text-amber-400" : "text-line"}`}
          />
        ))}
      </div>

      <p className="font-display text-lg md:text-2xl leading-relaxed text-ink mb-6">
        &ldquo;{t.quote}&rdquo;
      </p>

      <div className="flex items-center gap-3">
        {t.avatar_url ? (
          <img
            src={t.avatar_url}
            alt={t.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-accent-100 flex items-center justify-center text-accent font-display font-bold text-sm">
            {t.name.charAt(0)}
          </div>
        )}
        <div>
          <p className="font-semibold text-sm">{t.name}</p>
          <p className="text-xs text-muted">{t.role}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-8">
        <button
          onClick={() => move(-1)}
          aria-label="Previous testimonial"
          className="w-9 h-9 rounded-full bg-white border border-line flex items-center justify-center hover:border-accent transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => move(1)}
          aria-label="Next testimonial"
          className="w-9 h-9 rounded-full bg-white border border-line flex items-center justify-center hover:border-accent transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <div role="tablist" aria-label="Testimonial navigation" className="flex gap-1.5 ml-2">
          {items.map((item, i) => (
            <button
              key={item.id}
              role="tab"
              aria-selected={i === idx}
              aria-label={`Testimonial from ${item.name}`}
              onClick={() => setIdx(i)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === idx ? "bg-accent" : "bg-line hover:bg-muted"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}


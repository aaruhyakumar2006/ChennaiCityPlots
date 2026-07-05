"use client";
import { useState } from "react";
import { X, ChevronLeft, ChevronRight, LayoutTemplate, Images } from "lucide-react";

interface ImageItem {
  url: string;
  image_type?: "photo" | "floor_plan";
  sort_order?: number;
}

const FALLBACK = "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80";

export default function PropertyGallery({ images, name }: { images: ImageItem[]; name: string }) {
  const [tab, setTab] = useState<"photo" | "floor_plan">("photo");
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const photos     = images.filter((i) => !i.image_type || i.image_type === "photo").sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const floorPlans = images.filter((i) => i.image_type === "floor_plan").sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const active = tab === "photo"
    ? (photos.length > 0 ? photos : [{ url: FALLBACK }])
    : floorPlans;

  function openLightbox(idx: number) { setLightboxIdx(idx); }
  function closeLightbox() { setLightboxIdx(null); }
  function prev() { setLightboxIdx((i) => ((i! - 1 + active.length) % active.length)); }
  function next() { setLightboxIdx((i) => ((i! + 1) % active.length)); }

  return (
    <>
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => { setTab("photo"); setLightboxIdx(null); }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition ${
            tab === "photo" ? "bg-accent text-white border-accent" : "border-line hover:border-accent text-ink"
          }`}
        >
          <Images className="w-4 h-4" /> Photos ({photos.length || 1})
        </button>
        {floorPlans.length > 0 && (
          <button
            onClick={() => { setTab("floor_plan"); setLightboxIdx(null); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition ${
              tab === "floor_plan" ? "bg-accent text-white border-accent" : "border-line hover:border-accent text-ink"
            }`}
          >
            <LayoutTemplate className="w-4 h-4" /> Floor Plans ({floorPlans.length})
          </button>
        )}
      </div>

      {/* Grid */}
      {tab === "photo" ? (
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[360px] md:h-[460px] rounded-xl3 overflow-hidden">
          <button
            className="col-span-4 md:col-span-2 row-span-2 relative cursor-zoom-in overflow-hidden"
            onClick={() => openLightbox(0)}
          >
            <img src={active[0].url} alt={`${name} photo 1`} fetchPriority="high" className="w-full h-full object-cover" />
          </button>
          {active.slice(1, 5).map((img, i) => (
            <button key={i} className="hidden md:block relative cursor-zoom-in overflow-hidden" onClick={() => openLightbox(i + 1)}>
              <img src={img.url} alt={`${name} photo ${i + 2}`} className="w-full h-full object-cover" />
              {i === 3 && active.length > 5 && (
                <div className="absolute inset-0 bg-ink/50 flex items-center justify-center text-white font-semibold text-sm">
                  +{active.length - 5} more
                </div>
              )}
            </button>
          ))}
        </div>
      ) : (
        /* Floor plans — single row scrollable grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 rounded-xl3 overflow-hidden">
          {active.map((img, i) => (
            <button
              key={i}
              className="relative bg-surface rounded-xl2 overflow-hidden h-56 cursor-zoom-in border border-line hover:border-accent transition"
              onClick={() => openLightbox(i)}
            >
              <img src={img.url} alt={`${name} floor plan ${i + 1}`} className="w-full h-full object-contain p-3" />
              <span className="absolute bottom-2 left-2 text-[10px] font-semibold bg-accent text-white px-2 py-0.5 rounded-full">
                Plan {i + 1}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div className="fixed inset-0 z-[90] bg-ink/95 flex items-center justify-center">
          <button
            onClick={closeLightbox}
            aria-label="Close gallery"
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={prev}
            aria-label="Previous"
            className="absolute left-4 md:left-8 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            aria-label="Next"
            className="absolute right-4 md:right-8 w-11 h-11 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="max-h-[82vh] max-w-[88vw] w-[80vw] h-[70vh] flex items-center justify-center">
            <img
              src={active[lightboxIdx].url}
              alt={`${name} ${tab === "floor_plan" ? "floor plan" : "photo"} ${lightboxIdx + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <p className="absolute bottom-6 text-white/70 text-sm">
            {lightboxIdx + 1} / {active.length}
          </p>
        </div>
      )}
    </>
  );
}

import { useState, useEffect, useRef } from "react";
import { X, Plus, Minus, Loader2, UploadCloud, Trash2, GripVertical, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { PropertyRow, NearbyPlaceRow, PropertyImageRow, BuilderRow } from "@/types";

// ── helpers ─────────────────────────────────────────────────────────────────
function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function generatePropertyId() {
  const prefix = "PDH";
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${suffix}`;
}

const NEARBY_CATEGORIES = [
  "School", "Hospital", "Metro Station", "Bus Stop", "Mall / Shopping",
  "Airport", "IT Park", "Restaurant", "Park", "Bank / ATM", "Pharmacy", "Gym",
];

interface NearbyPlaceForm {
  id?: string;        // undefined = new
  name: string;
  category: string;
  distance_km: string;
  _deleted?: boolean;
}


interface FormState {
  property_id: string;
  name: string;
  slug: string;
  type: "RESIDENTIAL" | "COMMERCIAL";
  status: "READY_TO_MOVE" | "UNDER_CONSTRUCTION";
  location: string;
  address: string;
  price: string;
  area_min: string;
  area_max: string;
  plot_size_sqft: string;
  facing: string;
  dimensions: string;
  approval_status: string;
  rera_number: string;
  available_units: string;
  configuration: string;
  description: string;
  amenities: string[];
  featured: boolean;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
}

const BLANK: FormState = {
  property_id: "",
  name: "",
  slug: "",
  type: "RESIDENTIAL",
  status: "UNDER_CONSTRUCTION",
  location: "",
  address: "",
  price: "",
  area_min: "",
  area_max: "",
  plot_size_sqft: "",
  facing: "",
  dimensions: "",
  approval_status: "",
  rera_number: "",
  available_units: "",
  configuration: "",
  description: "",
  amenities: [],
  featured: false,
  seo_title: "",
  seo_description: "",
  seo_keywords: "",
};

function rowToForm(p: PropertyRow): FormState {
  return {
    property_id: p.property_id,
    name: p.name,
    slug: p.slug,
    type: p.type,
    status: p.status,
    location: p.location,
    address: p.address ?? "",
    price: String(p.price),
    area_min: p.area_min != null ? String(p.area_min) : "",
    area_max: p.area_max != null ? String(p.area_max) : "",
    plot_size_sqft: p.plot_size_sqft != null ? String(p.plot_size_sqft) : "",
    facing: p.facing ?? "",
    dimensions: p.dimensions ?? "",
    approval_status: p.approval_status ?? "",
    rera_number: p.rera_number ?? "",
    available_units: p.available_units != null ? String(p.available_units) : "",
    configuration: p.configuration ?? "",
    description: p.description,
    amenities: p.amenities ?? [],
    featured: p.featured,
    seo_title: p.seo_title ?? "",
    seo_description: p.seo_description ?? "",
    seo_keywords: p.seo_keywords ?? "",
  };
}

// ── sub-components ────────────────────────────────────────────────────────────
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-ink-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full px-3.5 py-2.5 rounded-xl2 border border-line text-sm focus:border-accent focus:outline-none disabled:opacity-60 bg-white";

// ── main component ────────────────────────────────────────────────────────────
interface Props {
  /** If provided, the form is in edit mode. */
  property?: PropertyRow;
  onClose: () => void;
  onSaved: (property: PropertyRow) => void;
}

export default function PropertyFormModal({ property, onClose, onSaved }: Props) {
  const isEdit = !!property;
  const [form, setForm] = useState<FormState>(() =>
    property ? rowToForm(property) : { ...BLANK, property_id: generatePropertyId() }
  );
  const [amenityInput, setAmenityInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [builders, setBuilders] = useState<BuilderRow[]>([]);
  const [builderId, setBuilderId] = useState<string>(property?.builder_id ?? "");
  const [uploadedImages, setUploadedImages] = useState<{ url: string; publicId: string; imageType: "photo" | "floor_plan" }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState<"photo" | "floor_plan">("photo");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // ── Existing images (edit mode) ────────────────────────────────────────────
  const [existingImages, setExistingImages] = useState<PropertyImageRow[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const dragIdx = useRef<number | null>(null);

  useEffect(() => {
    if (!isEdit || !property) return;
    supabase
      .from("property_images")
      .select("id, url, sort_order, property_id")
      .eq("property_id", property.id)
      .order("sort_order", { ascending: true })
      .then(({ data }) => setExistingImages((data as PropertyImageRow[]) ?? []));
  }, [isEdit, property?.id]);

  function handleDragStart(idx: number) { dragIdx.current = idx; }
  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === idx) return;
    setExistingImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIdx.current!, 1);
      next.splice(idx, 0, moved);
      dragIdx.current = idx;
      return next;
    });
  }
  function handleDragEnd() { dragIdx.current = null; }

  async function deleteExistingImage(id: string) {
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
    setDeletedImageIds((prev) => [...prev, id]);
  }

  // ── Nearby places (edit mode) ──────────────────────────────────────────────
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlaceForm[]>([]);
  const blankPlace = (): NearbyPlaceForm => ({ name: "", category: NEARBY_CATEGORIES[0], distance_km: "" });

  useEffect(() => {
    if (!isEdit || !property) return;
    supabase
      .from("nearby_places")
      .select("id, name, category, distance_km, property_id")
      .eq("property_id", property.id)
      .order("distance_km", { ascending: true })
      .then(({ data }) => {
        const places = (data as NearbyPlaceRow[]) ?? [];
        setNearbyPlaces(places.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          distance_km: String(p.distance_km),
        })));
      });
  }, [isEdit, property?.id]);

  function addPlace() { setNearbyPlaces((prev) => [...prev, blankPlace()]); }
  function removePlace(idx: number) {
    setNearbyPlaces((prev) => {
      const next = [...prev];
      // If it has a DB id, mark for deletion
      if (next[idx].id) next[idx] = { ...next[idx], _deleted: true };
      else next.splice(idx, 1);
      return next;
    });
  }
  function updatePlace(idx: number, field: keyof NearbyPlaceForm, val: string) {
    setNearbyPlaces((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  }

  async function uploadToCloudinary(file: File) {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      throw new Error("Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env");
    }
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", uploadPreset);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: fd });
    if (!res.ok) throw new Error("Cloudinary upload failed");
    const data = await res.json();
    return { url: data.secure_url as string, publicId: data.public_id as string };
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setError("");
    try {
      const results = await Promise.all(files.map(uploadToCloudinary));
      setUploadedImages((prev) => [...prev, ...results.map((r) => ({ ...r, imageType: uploadType }))]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // Auto-derive slug from name when creating
  useEffect(() => {
    if (!isEdit) {
      setForm((f) => ({ ...f, slug: slugify(f.name) }));
    }
  }, [form.name, isEdit]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Load builders for dropdown
  useEffect(() => {
    (supabase.from("builders") as any).select("id, name").order("name", { ascending: true })
      .then(({ data }: any) => setBuilders((data as BuilderRow[]) ?? []));
  }, []);

  function set(key: keyof FormState, value: FormState[keyof FormState]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function addAmenity() {
    const a = amenityInput.trim();
    if (!a || form.amenities.includes(a)) return;
    setForm((f) => ({ ...f, amenities: [...f.amenities, a] }));
    setAmenityInput("");
  }

  function removeAmenity(a: string) {
    setForm((f) => ({ ...f, amenities: f.amenities.filter((x) => x !== a) }));
  }


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const price = Number(form.price);
    if (!form.name.trim()) { setError("Property name is required."); return; }
    if (!form.location.trim()) { setError("Location is required."); return; }
    if (!form.description.trim()) { setError("Description is required."); return; }
    if (isNaN(price) || price <= 0) { setError("Enter a valid price (in ₹)."); return; }

    const payload = {
      property_id: form.property_id.trim() || generatePropertyId(),
      name: form.name.trim(),
      slug: form.slug.trim() || slugify(form.name),
      type: form.type,
      status: form.status,
      location: form.location.trim(),
      address: form.address.trim() || null,
      price,
      area_min: form.area_min ? Number(form.area_min) : null,
      area_max: form.area_max ? Number(form.area_max) : null,
      plot_size_sqft: form.plot_size_sqft ? Number(form.plot_size_sqft) : null,
      facing: form.facing.trim() || null,
      dimensions: form.dimensions.trim() || null,
      approval_status: form.approval_status.trim() || null,
      rera_number: form.rera_number.trim() || null,
      available_units: form.available_units ? Number(form.available_units) : null,
      configuration: form.configuration.trim() || null,
      description: form.description.trim(),
      amenities: form.amenities,
      featured: form.featured,
      builder_id: builderId || null,
      possession_year: (form as any).possession_year ? Number((form as any).possession_year) : null,
      seo_title: form.seo_title.trim() || null,
      seo_description: form.seo_description.trim() || null,
      seo_keywords: form.seo_keywords.trim() || null,
    };

    setSaving(true);
    try {
      if (isEdit && property) {
        const { data, error: err } = await (supabase
          .from("properties") as ReturnType<typeof supabase.from>)
          .update(payload)
          .eq("id", property.id)
          .select()
          .single();
        if (err) throw err;
        const propId = (data as PropertyRow).id;

        // ── Image operations ─────────────────────────────────────────────────
        // 1. Delete removed images
        if (deletedImageIds.length > 0) {
          await supabase.from("property_images").delete().in("id", deletedImageIds);
        }
        // 2. Update sort_order for remaining existing images
        await Promise.all(
          existingImages.map((img, i) =>
            (supabase.from("property_images") as ReturnType<typeof supabase.from>)
              .update({ sort_order: i } as never)
              .eq("id", img.id)
              .then(() => {})
          )
        );
        // 3. Insert newly uploaded images
        if (uploadedImages.length > 0) {
          await supabase.from("property_images").insert(
            uploadedImages.map((img, i) => ({
              property_id: propId,
              url: img.url,
              sort_order: existingImages.length + i,
              image_type: img.imageType,
            })) as never[]
          );
        }

        // ── Nearby places operations ─────────────────────────────────────────
        const toDelete  = nearbyPlaces.filter((p) => p._deleted && p.id).map((p) => p.id!);
        const toInsert  = nearbyPlaces.filter((p) => !p._deleted && !p.id && p.name.trim());
        const toUpdate  = nearbyPlaces.filter((p) => !p._deleted && p.id && p.name.trim());

        if (toDelete.length > 0) {
          await supabase.from("nearby_places").delete().in("id", toDelete);
        }
        if (toInsert.length > 0) {
          await supabase.from("nearby_places").insert(
            toInsert.map((p) => ({
              property_id: propId,
              name: p.name.trim(),
              category: p.category,
              distance_km: parseFloat(p.distance_km) || 0,
            })) as never[]
          );
        }
        await Promise.all(
          toUpdate.map((p) =>
            (supabase.from("nearby_places") as ReturnType<typeof supabase.from>)
              .update({ name: p.name.trim(), category: p.category, distance_km: parseFloat(p.distance_km) || 0 } as never)
              .eq("id", p.id!)
              .then(() => {})
          )
        );

        onSaved(data as PropertyRow);
      } else {
        const { data, error: err } = await (supabase
          .from("properties") as ReturnType<typeof supabase.from>)
          .insert(payload as never)
          .select()
          .single();
        if (err) throw err;
        const propId = (data as PropertyRow).id;

        if (uploadedImages.length > 0) {
          await supabase.from("property_images").insert(
            uploadedImages.map((img, i) => ({ property_id: propId, url: img.url, sort_order: i, image_type: img.imageType })) as never[]
          );
        }
        onSaved(data as PropertyRow);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("slug")) setError("A property with this slug already exists. Edit the slug field below.");
      else setError(msg);
    } finally {
      setSaving(false);
    }
  }


  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="bg-white rounded-xl3 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line shrink-0">
          <h2 className="font-display font-bold text-lg">
            {isEdit ? "Edit Property" : "Create Property"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-surface flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form
          id="property-form"
          onSubmit={handleSubmit}
          className="overflow-y-auto flex-1 px-6 py-5 space-y-6"
        >
          {/* ── Section: Basic Info ── */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-accent mb-4">Basic Info</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Property ID" required>
                <input
                  className={inputCls}
                  value={form.property_id}
                  onChange={(e) => set("property_id", e.target.value)}
                  placeholder="PDH-1234"
                />
              </Field>
              <Field label="Type">
                <select
                  className={inputCls}
                  value={form.type}
                  onChange={(e) => set("type", e.target.value as FormState["type"])}
                >
                  <option value="RESIDENTIAL">Residential</option>
                  <option value="COMMERCIAL">Commercial</option>
                </select>
              </Field>
              <Field label="Property Name" required>
                <input
                  className={`${inputCls} col-span-2`}
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Prabha Gardens"
                  required
                />
              </Field>
              <Field label="URL Slug">
                <input
                  className={inputCls}
                  value={form.slug}
                  onChange={(e) => set("slug", slugify(e.target.value))}
                  placeholder="auto-generated"
                />
              </Field>
              <Field label="Status">
                <select
                  className={inputCls}
                  value={form.status}
                  onChange={(e) => set("status", e.target.value as FormState["status"])}
                >
                  <option value="UNDER_CONSTRUCTION">Under Construction</option>
                  <option value="READY_TO_MOVE">Ready to Move</option>
                </select>
              </Field>
            </div>
          </div>

          {/* ── Section: Location ── */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-accent mb-4">Location</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Location / Area" required>
                <input
                  className={inputCls}
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                  placeholder="Anna Nagar, Chennai"
                  required
                />
              </Field>
              <Field label="Full Address">
                <input
                  className={inputCls}
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="123, Main Road…"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Field label="Latitude">
                <input
                  type="number"
                  step="any"
                  className={inputCls}
                  value={(form as any).latitude ?? ""}
                  onChange={(e) => set("latitude" as any, e.target.value)}
                  placeholder="13.0827"
                />
              </Field>
              <Field label="Longitude">
                <input
                  type="number"
                  step="any"
                  className={inputCls}
                  value={(form as any).longitude ?? ""}
                  onChange={(e) => set("longitude" as any, e.target.value)}
                  placeholder="80.2707"
                />
              </Field>
            </div>
          </div>

          {/* ── Section: Pricing & Size ── */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-accent mb-4">Pricing &amp; Size</p>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Price (₹)" required>
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  placeholder="500000"
                  required
                />
              </Field>
              <Field label="Area Min (sq.ft)">
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={form.area_min}
                  onChange={(e) => set("area_min", e.target.value)}
                  placeholder="100"
                />
              </Field>
              <Field label="Area Max (sq.ft)">
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={form.area_max}
                  onChange={(e) => set("area_max", e.target.value)}
                  placeholder="2400"
                />
              </Field>
              <Field label="Plot Size (sq.ft)">
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={form.plot_size_sqft}
                  onChange={(e) => set("plot_size_sqft", e.target.value)}
                  placeholder="600"
                />
              </Field>
              <Field label="Dimensions">
                <input
                  className={inputCls}
                  value={form.dimensions}
                  onChange={(e) => set("dimensions", e.target.value)}
                  placeholder="30×40 ft"
                />
              </Field>
              <Field label="Facing">
                <input
                  className={inputCls}
                  value={form.facing}
                  onChange={(e) => set("facing", e.target.value)}
                  placeholder="East"
                />
              </Field>
            </div>
          </div>

          {/* ── Section: Project Details ── */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-accent mb-4">Project Details</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Configuration">
                <input className={inputCls} value={form.configuration} onChange={(e) => set("configuration", e.target.value)} placeholder="2BHK, 3BHK" />
              </Field>
              <Field label="Available Units">
                <input type="number" min={0} className={inputCls} value={form.available_units} onChange={(e) => set("available_units", e.target.value)} placeholder="24" />
              </Field>
              <Field label="Approval Status">
                <input className={inputCls} value={form.approval_status} onChange={(e) => set("approval_status", e.target.value)} placeholder="DTCP Approved" />
              </Field>
              <Field label="RERA Number">
                <input className={inputCls} value={form.rera_number} onChange={(e) => set("rera_number", e.target.value)} placeholder="TN/01/Building/..." />
              </Field>
              <Field label="Possession Year">
                <input type="number" className={inputCls} value={(form as any).possession_year ?? ""} onChange={(e) => set("possession_year" as any, e.target.value)} placeholder="e.g. 2026" />
              </Field>
              <Field label="Builder / Developer">
                <select className={inputCls} value={builderId} onChange={(e) => setBuilderId(e.target.value)}>
                  <option value="">— None —</option>
                  {builders.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </Field>
            </div>
          </div>

          {/* ── Section: Description ── */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-accent mb-4">Description</p>
            <Field label="Property Description" required>
              <textarea
                className={`${inputCls} min-h-[100px] resize-y`}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Describe the property…"
                required
              />
            </Field>
          </div>

          {/* ── Section: Amenities ── */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-accent mb-4">Amenities</p>
            <div className="flex gap-2 mb-3">
              <input
                className={inputCls}
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); addAmenity(); }
                }}
                placeholder="Swimming Pool"
              />
              <button
                type="button"
                onClick={addAmenity}
                className="px-3 py-2.5 rounded-xl2 bg-accent text-white shrink-0 hover:bg-accent/90 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {form.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.amenities.map((a) => (
                  <span
                    key={a}
                    className="flex items-center gap-1.5 text-xs font-semibold bg-accent-50 text-accent px-3 py-1 rounded-full"
                  >
                    {a}
                    <button
                      type="button"
                      onClick={() => removeAmenity(a)}
                      className="hover:text-red-500 transition"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── Section: Visibility ── */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-accent mb-4">Visibility</p>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set("featured", e.target.checked)}
                className="w-4 h-4 accent-accent rounded"
              />
              <span className="text-sm font-medium">Feature on Homepage</span>
            </label>
          </div>

          {/* ── Section: Images ── */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-accent mb-4">Property Images</p>

            {/* Image type toggle */}
            <div className="flex gap-2 mb-4">
              {(["photo", "floor_plan"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setUploadType(t)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                    uploadType === t ? "bg-accent text-white border-accent" : "border-line hover:border-accent"
                  }`}
                >
                  {t === "photo" ? "📷 Photos" : "📐 Floor Plans"}
                </button>
              ))}
            </div>

            {/* Existing images — edit mode only */}
            {isEdit && existingImages.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-muted mb-2">Drag to reorder · hover to delete</p>
                <div className="grid grid-cols-3 gap-2">
                  {existingImages.map((img, i) => (
                    <div
                      key={img.id}
                      draggable
                      onDragStart={() => handleDragStart(i)}
                      onDragOver={(e) => handleDragOver(e, i)}
                      onDragEnd={handleDragEnd}
                      className="relative group rounded-xl2 overflow-hidden h-24 cursor-grab active:cursor-grabbing border-2 border-transparent hover:border-accent transition"
                    >
                      <img src={img.url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                        <GripVertical className="w-4 h-4 text-white/70" />
                        <button
                          type="button"
                          onClick={() => deleteExistingImage(img.id)}
                          className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition"
                          aria-label="Delete image"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                      {i === 0 && (
                        <span className="absolute top-1.5 left-1.5 text-[9px] font-bold bg-accent text-white px-1.5 py-0.5 rounded-full">Cover</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div
              className="border-2 border-dashed border-line rounded-xl2 p-6 text-center cursor-pointer hover:border-accent transition"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              {uploading ? (
                <Loader2 className="w-6 h-6 text-accent mx-auto animate-spin" />
              ) : (
                <>
                  <UploadCloud className="w-7 h-7 text-muted mx-auto mb-2" />
                  <p className="text-sm text-muted">Click to upload {isEdit ? "more" : ""} images</p>
                  <p className="text-xs text-muted/70 mt-1">JPG, PNG, WebP — multiple allowed</p>
                </>
              )}
            </div>
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {uploadedImages.map((img, i) => (
                  <div key={img.publicId} className="relative group rounded-xl2 overflow-hidden h-24">
                    <img src={img.url} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setUploadedImages((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                      aria-label="Remove image"
                    >
                      <Trash2 className="w-5 h-5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Section: Nearby Places (edit only) ── */}
          {isEdit ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Nearby Places
                </p>
                <button
                  type="button"
                  onClick={addPlace}
                  className="flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-700 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Place
                </button>
              </div>
              <div className="space-y-2">
                {nearbyPlaces.filter((p) => !p._deleted).map((place, i) => (
                  <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
                    <input
                      className={inputCls}
                      placeholder="Place name (e.g. DPS School)"
                      value={place.name}
                      onChange={(e) => updatePlace(i, "name", e.target.value)}
                    />
                    <select
                      className={`${inputCls} min-w-[130px]`}
                      value={place.category}
                      onChange={(e) => updatePlace(i, "category", e.target.value)}
                    >
                      {NEARBY_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      className={`${inputCls} w-24`}
                      placeholder="km"
                      value={place.distance_km}
                      onChange={(e) => updatePlace(i, "distance_km", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removePlace(i)}
                      className="w-8 h-8 flex items-center justify-center text-muted hover:text-red-500 transition shrink-0"
                      aria-label="Remove place"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {nearbyPlaces.filter((p) => !p._deleted).length === 0 && (
                  <p className="text-xs text-muted py-3 text-center border border-dashed border-line rounded-xl2">
                    No nearby places yet — click "Add Place" above.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-surface rounded-xl2 px-4 py-3 text-xs text-muted flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              Save the property first, then edit it to add nearby places (schools, hospitals, metro etc.)
            </div>
          )}

          {/* ── Section: SEO ── */}

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-accent mb-4">SEO</p>
            <div className="space-y-4">
              <Field label="SEO Title">
                <input
                  className={inputCls}
                  value={form.seo_title}
                  onChange={(e) => set("seo_title", e.target.value)}
                  placeholder="Best 2BHK Plots in Anna Nagar"
                />
              </Field>
              <Field label="SEO Description">
                <textarea
                  className={`${inputCls} min-h-[72px] resize-y`}
                  value={form.seo_description}
                  onChange={(e) => set("seo_description", e.target.value)}
                  placeholder="Discover premium…"
                />
              </Field>
              <Field label="SEO Keywords (comma-separated)">
                <input
                  className={inputCls}
                  value={form.seo_keywords}
                  onChange={(e) => set("seo_keywords", e.target.value)}
                  placeholder="plots, anna nagar, DTCP"
                />
              </Field>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl2 px-4 py-3">
              {error}
            </p>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-line shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl2 border border-line text-sm font-semibold hover:border-accent transition"
          >
            Cancel
          </button>
          <button
            form="property-form"
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-xl2 bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition disabled:opacity-60 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Property"}
          </button>
        </div>
      </div>
    </div>
  );
}

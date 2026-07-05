import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import StatusBadge from "@/components/StatusBadge";
import PropertyRowActions from "@/components/admin/PropertyRowActions";
import PropertyFormModal from "@/components/admin/PropertyFormModal";
import { formatPriceLabel } from "@/lib/format";
import type { PropertyRow } from "@/types";

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<PropertyRow | undefined>(undefined);

  useEffect(() => {
    supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProperties((data as PropertyRow[]) ?? []);
        setLoading(false);
      });
  }, []);

  function openCreate() {
    setEditingProperty(undefined);
    setModalOpen(true);
  }

  function openEdit(p: PropertyRow) {
    setEditingProperty(p);
    setModalOpen(true);
  }

  function handleDelete(id: string) {
    setProperties((prev) => prev.filter((p) => p.id !== id));
  }

  function handleSaved(saved: PropertyRow) {
    if (editingProperty) {
      // Edit — replace row in place
      setProperties((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
    } else {
      // Create — prepend
      setProperties((prev) => [saved, ...prev]);
    }
    setModalOpen(false);
  }

  return (
    <>
      <div className="bg-white rounded-xl2 border border-line overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <p className="text-sm text-muted">{properties.length} properties</p>
          <button
            className="px-4 py-2 rounded-xl2 bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition"
            onClick={openCreate}
          >
            + Create Property
          </button>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-muted animate-pulse">Loading properties…</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-surface text-left text-xs text-muted uppercase">
                <tr>
                  <th className="px-5 py-3 font-semibold">Property</th>
                  <th className="px-5 py-3 font-semibold">Location</th>
                  <th className="px-5 py-3 font-semibold">Price</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Type</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p) => (
                  <tr key={p.id} className="border-t border-line hover:bg-surface/60">
                    <td className="px-5 py-3.5">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted">{p.property_id}</p>
                    </td>
                    <td className="px-5 py-3.5 text-muted">{p.location}</td>
                    <td className="px-5 py-3.5 font-medium">{formatPriceLabel(p.price)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
                    <td className="px-5 py-3.5 text-muted">{p.type === "RESIDENTIAL" ? "Residential" : "Commercial"}</td>
                    <td className="px-5 py-3.5">
                      <PropertyRowActions
                        id={p.id}
                        slug={p.slug}
                        onEdit={() => openEdit(p)}
                        onDelete={handleDelete}
                      />
                    </td>
                  </tr>
                ))}
                {properties.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-muted">
                      No properties yet — click "Create Property" to add one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalOpen && (
        <PropertyFormModal
          property={editingProperty}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}


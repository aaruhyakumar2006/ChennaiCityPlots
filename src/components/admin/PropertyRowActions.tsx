import { Link } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Eye, Pencil, Trash2 } from "lucide-react";

export default function PropertyRowActions({
  id,
  slug,
  onEdit,
  onDelete,
}: {
  id: string;
  slug: string;
  onEdit: () => void;
  onDelete: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this property? This cannot be undone.")) return;
    setDeleting(true);
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) {
      alert("Could not delete property: " + error.message);
    } else {
      onDelete(id);
    }
    setDeleting(false);
  }

  return (
    <div className="flex justify-end gap-1.5">
      <Link
        to={`/properties/${slug}`}
        target="_blank"
        title="View on site"
        className="w-8 h-8 rounded-lg hover:bg-surface flex items-center justify-center"
      >
        <Eye className="w-4 h-4 text-muted" />
      </Link>
      <button
        title="Edit"
        className="w-8 h-8 rounded-lg hover:bg-surface flex items-center justify-center"
        onClick={onEdit}
      >
        <Pencil className="w-4 h-4 text-muted" />
      </button>
      <button
        title="Delete"
        disabled={deleting}
        className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center disabled:opacity-60"
        onClick={handleDelete}
      >
        <Trash2 className="w-4 h-4 text-red-500" />
      </button>
    </div>
  );
}

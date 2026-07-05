"use client";

export default function CreatePropertyButton() {
  return (
    <button
      className="px-4 py-2 rounded-xl2 bg-accent text-white text-sm font-semibold"
      onClick={() => alert("Wire this up to a create-property form — out of scope for the starter.")}
    >
      + Create Property
    </button>
  );
}

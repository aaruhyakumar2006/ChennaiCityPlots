import { Download } from "lucide-react";

interface LeadRow {
  id: string;
  name: string;
  mobile: string;
  email: string;
  status: string;
  notes: string | null;
  followUpAt: string | null;
  property: { name: string } | null;
}

export default function ExportLeadsCsvButton({ leads }: { leads: LeadRow[] }) {
  function exportCsv() {
    const header = ["ID", "Name", "Mobile", "Email", "Property", "Status", "Notes", "Follow-up"];
    const rows = leads.map((l) => [
      l.id, l.name, l.mobile, l.email, l.property?.name ?? "—", l.status, l.notes ?? "", l.followUpAt ?? "",
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={exportCsv}
      className="px-4 py-2 rounded-xl2 border border-line text-sm font-semibold hover:border-accent hover:text-accent transition flex items-center gap-2"
    >
      <Download className="w-4 h-4" /> Export CSV
    </button>
  );
}

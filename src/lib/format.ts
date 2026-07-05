export function formatINR(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN");
}

export function formatPriceLabel(amount: number): string {
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(2).replace(/\.?0+$/, "")} Cr`;
  if (amount >= 100_000)    return `₹${(amount / 100_000).toFixed(2).replace(/\.?0+$/, "")} L`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function statusLabel(status: string): string {
  return status
    .toLowerCase()
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

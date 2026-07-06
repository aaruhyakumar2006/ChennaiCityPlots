import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet's broken default icon paths when bundled with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const CATEGORY_COLORS: Record<string, string> = {
  school:          "#10B981",
  hospital:        "#EF4444",
  metro:           "#8B5CF6",
  "metro station": "#8B5CF6",
  shopping:        "#F59E0B",
  mall:            "#F59E0B",
  airport:         "#064E3B",
  "it park":       "#0EA5E9",
  tech:            "#0EA5E9",
  highway:         "#84CC16",
  park:            "#22C55E",
  default:         "#2563EB",
};

function coloredIcon(category: string) {
  const key = category.toLowerCase();
  const color =
    CATEGORY_COLORS[key] ??
    Object.entries(CATEGORY_COLORS).find(([k]) => key.includes(k))?.[1] ??
    CATEGORY_COLORS.default;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 42" width="28" height="42">
    <filter id="s"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.25"/></filter>
    <path filter="url(#s)" d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 28 14 28s14-17.5 14-28C28 6.3 21.7 0 14 0z" fill="${color}"/>
    <circle cx="14" cy="14" r="6" fill="white" opacity="0.95"/>
  </svg>`;

  return L.divIcon({
    html: svg,
    className: "",
    iconSize:   [28, 42],
    iconAnchor: [14, 42],
    popupAnchor:[0, -44],
  });
}

function propertyIcon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 54" width="36" height="54">
    <filter id="ps"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity="0.35"/></filter>
    <path filter="url(#ps)" d="M18 0C8.1 0 0 8.1 0 18c0 13.5 18 36 18 36S36 31.5 36 18C36 8.1 27.9 0 18 0z" fill="#2563EB"/>
    <circle cx="18" cy="18" r="8" fill="white" opacity="0.95"/>
    <path d="M18 12l-7 6h2v7h4v-4h2v4h4v-7h2z" fill="#2563EB"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize:   [36, 54],
    iconAnchor: [18, 54],
    popupAnchor:[0, -56],
  });
}

interface Pin {
  label: string;
  category?: string;
  lat?: number;
  lng?: number;
  x?: number;
  y?: number;
}

interface PropertyMapProps {
  pins?: Pin[];
  center?: [number, number];
  zoom?: number;
  propertyName?: string;
}

const CHENNAI: [number, number] = [13.0827, 80.2707];

const OFFSETS = [
  [0.014, 0.020], [-0.012, 0.016], [0.009, -0.022],
  [-0.017, -0.011], [0.022, 0.006], [-0.008, -0.018],
];

export default function PropertyMap({
  pins = [],
  center = CHENNAI,
  zoom = 14,
  propertyName = "Property Location",
}: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      scrollWheelZoom: false,
      attributionControl: true,
    }).setView(center, zoom);

    mapRef.current = map;

    // Add zoom control top-right
    L.control.zoom({ position: "topright" }).addTo(map);

    // Tile layer — OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Property centre marker
    L.marker(center, { icon: propertyIcon() })
      .addTo(map)
      .bindPopup(`<div style="font-weight:600;font-size:13px;padding:2px 0">${propertyName}</div>`)
      .openPopup();

    // Nearby place markers
    pins.slice(0, 6).forEach((pin, i) => {
      const lat = pin.lat ?? center[0] + OFFSETS[i % OFFSETS.length][0];
      const lng = pin.lng ?? center[1] + OFFSETS[i % OFFSETS.length][1];
      L.marker([lat, lng], { icon: coloredIcon(pin.category ?? "default") })
        .addTo(map)
        .bindPopup(
          `<div style="font-weight:600;font-size:13px">${pin.label}</div>` +
          (pin.category ? `<div style="font-size:11px;color:#6b7280;margin-top:2px">${pin.category}</div>` : "")
        );
    });

    // Force resize after mount (fixes tiles not loading in hidden containers)
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-line shadow-sm"
         style={{ height: "420px" }}>
      {/* Map container — no overflow-hidden here so tiles render */}
      <div
        ref={containerRef}
        className="absolute inset-0 z-0"
        style={{ height: "100%", width: "100%" }}
      />
      {/* Legend */}
      {pins.length > 0 && (
        <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-sm rounded-xl border border-line shadow-card px-3 py-2 max-w-[200px]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1.5">Nearby</p>
          <div className="space-y-1">
            {pins.slice(0, 5).map((p, i) => {
              const key = (p.category ?? "default").toLowerCase();
              const color =
                CATEGORY_COLORS[key] ??
                Object.entries(CATEGORY_COLORS).find(([k]) => key.includes(k))?.[1] ??
                CATEGORY_COLORS.default;
              return (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                  <span className="text-[11px] text-ink truncate">{p.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

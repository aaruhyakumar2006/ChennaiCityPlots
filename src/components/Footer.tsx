import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Home as HomeIcon, MapPin, Phone, Mail, Facebook, Instagram, Linkedin } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icon paths in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Office location — Nanganallur, Chennai
const OFFICE: [number, number] = [12.9856, 80.1935];

function OfficeMap() {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, { zoomControl: false, scrollWheelZoom: false, dragging: false })
      .setView(OFFICE, 15);
    mapRef.current = map;
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    }).addTo(map);
    L.marker(OFFICE).addTo(map).bindPopup("Chennai City Plots").openPopup();
    setTimeout(() => map.invalidateSize(), 100);
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  return (
    <div className="relative rounded-xl overflow-hidden" style={{ height: "128px" }}>
      <div ref={ref} className="absolute inset-0 z-0" style={{ height: "100%", width: "100%" }} />
    </div>
  );
}

export default function Footer() {
  return (
    <footer id="contact" className="bg-ink text-gray-300 mt-24">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-16 grid sm:grid-cols-2 md:grid-cols-5 gap-10">
        {/* Brand */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-9 h-9 rounded-xl2 seal flex items-center justify-center">
              <HomeIcon className="w-5 h-5 text-white" />
            </span>
            <span className="font-display font-bold text-lg text-white">Madras City Plots</span>
          </div>
          <p className="text-sm leading-relaxed text-gray-400">
            Chennai's trusted plot broker — CMDA &amp; DTCP approved plots across all major localities.
            Transparent pricing, legal assistance and end-to-end support.
          </p>
          <div className="flex gap-3 mt-5">
            {[Facebook, Instagram, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="text-white font-display font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2.5 text-sm text-gray-400">
            <li><Link to="/" className="hover:text-accent transition">Home</Link></li>
            <li><Link to="/properties" className="hover:text-accent transition">Browse Plots</Link></li>
            <li><Link to="/properties?type=RESIDENTIAL" className="hover:text-accent transition">Residential Plots</Link></li>
            <li><Link to="/properties?type=COMMERCIAL" className="hover:text-accent transition">Commercial Plots</Link></li>
            <li><Link to="/compare" className="hover:text-accent transition">Compare Plots</Link></li>
            <li><Link to="/saved" className="hover:text-accent transition">Saved Plots</Link></li>
          </ul>
        </div>

        {/* Popular Localities */}
        <div>
          <h4 className="text-white font-display font-semibold mb-4">Popular Localities</h4>
          <ul className="space-y-2.5 text-sm text-gray-400">
            {[
              ["OMR", "omr-chennai"],
              ["Anna Nagar", "anna-nagar"],
              ["Velachery", "velachery"],
              ["Porur", "porur"],
              ["Perungudi", "perungudi"],
              ["Sholinganallur", "sholinganallur"],
            ].map(([label, slug]) => (
              <li key={slug}>
                <Link to={`/properties/location/${slug}`} className="hover:text-accent transition">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-display font-semibold mb-4">Contact Us</h4>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex gap-2">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-accent" />
              Srinivas Flats, Block 2, S1, 2nd Floor, Plot Nos. 1, 2 &amp; 3 Ponnuswamy Street, Ullagaram, Nanganallur, Chennai 600061
              <span className="text-gray-500">(Opp to Sri Krishna Sweets)</span>
            </li>
            <li className="flex gap-2">
              <Phone className="w-4 h-4 mt-0.5 shrink-0 text-accent" />
              +91 63696 78465
            </li>
            <li className="flex gap-2">
              <Mail className="w-4 h-4 mt-0.5 shrink-0 text-accent" />
              <a href="mailto:madrascityplot@gmail.com" className="hover:text-accent transition">madrascityplot@gmail.com</a>
            </li>
          </ul>
          <div className="mt-5">
            <OfficeMap />
          </div>
        </div>
      </div>


      <div className="border-t border-white/10 py-5 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Madras City Plots. All rights reserved. · DTCP &amp; CMDA Approved Plot Broker, Chennai.
      </div>
    </footer>
  );
}


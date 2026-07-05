interface Pin {
  label: string;
  x: number;
  y: number;
}

export default function MockMap({ pins }: { pins: Pin[] }) {
  return (
    <div className="relative w-full h-[360px] md:h-[440px] rounded-xl3 overflow-hidden border border-line bg-[#EAF0FB]">
      <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0,30 Q25,20 50,32 T100,28" stroke="#C7D6F5" strokeWidth="1.4" fill="none" />
        <path d="M0,65 Q35,55 60,68 T100,60" stroke="#C7D6F5" strokeWidth="1.4" fill="none" />
        <path d="M20,0 Q30,40 22,100" stroke="#C7D6F5" strokeWidth="1.2" fill="none" />
        <path d="M75,0 Q65,45 80,100" stroke="#C7D6F5" strokeWidth="1.2" fill="none" />
      </svg>
      {pins.map((p, i) => (
        <div key={i} className="absolute group" style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%,-100%)" }}>
          <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center shadow-soft">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="w-2 h-2 bg-accent rotate-45 mx-auto -mt-1" />
          <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 whitespace-nowrap text-[11px] font-semibold bg-white px-2 py-0.5 rounded-full shadow-card opacity-0 group-hover:opacity-100 transition">
            {p.label}
          </span>
        </div>
      ))}
      <div className="absolute bottom-4 left-4 bg-white/95 rounded-xl2 px-4 py-3 shadow-card text-xs text-muted max-w-[220px]">
        Illustrative map — connect Google Maps API in production for live directions and distances.
      </div>
    </div>
  );
}

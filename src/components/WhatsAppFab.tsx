interface Props {
  propertyName?: string | null;
}

const PHONE = "916369678465";
const GENERIC_MSG = encodeURIComponent("Hi, I'm interested in a property on Madras City Plots. Could you please share more details?");

export default function WhatsAppFab({ propertyName }: Props) {
  const message = propertyName
    ? encodeURIComponent(`Hi, I'm interested in "${propertyName}" on Madras City Plots. Could you please share more details?`)
    : GENERIC_MSG;

  return (
    <a
      href={`https://wa.me/${PHONE}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-ok shadow-soft flex items-center justify-center hover:scale-110 transition-transform group"
      aria-label={propertyName ? `Chat about ${propertyName}` : "Chat on WhatsApp"}
      title={propertyName ? `Enquire about ${propertyName}` : "Chat on WhatsApp"}
    >
      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.47 1.34 4.98L2 22l5.2-1.36a9.94 9.94 0 004.84 1.23h.01c5.5 0 9.96-4.46 9.96-9.96S17.54 2 12.04 2zm5.84 14.24c-.25.7-1.45 1.34-2 1.43-.54.08-1.07.31-3.6-.75-3.04-1.28-5-4.4-5.16-4.6-.15-.2-1.24-1.65-1.24-3.15 0-1.5.79-2.23 1.07-2.54.28-.31.6-.39.8-.39.2 0 .4 0 .58.01.18.01.43-.07.68.52.25.6.85 2.06.92 2.21.07.15.12.33.02.53-.1.2-.15.32-.3.5-.15.18-.31.4-.45.54-.15.15-.3.31-.13.6.17.3.76 1.25 1.63 2.02 1.12 1 2.07 1.31 2.36 1.46.3.15.47.13.64-.08.18-.2.74-.86.94-1.16.2-.3.4-.24.66-.15.27.1 1.7.8 1.99.95.3.15.49.22.56.35.08.13.08.74-.17 1.44z" />
      </svg>
      {/* Tooltip */}
      {propertyName && (
        <span className="absolute bottom-full right-0 mb-2 w-48 text-[10px] bg-slate-900 text-white rounded-xl px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-left leading-snug">
          Chat about <strong className="text-accent">{propertyName}</strong>
        </span>
      )}
    </a>
  );
}


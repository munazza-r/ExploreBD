import { Compass } from "lucide-react";

export default function BrandMark({ compact = false }) {
  return (
    <span className="flex items-center gap-3">
      <span className={`${compact ? "h-9 w-9" : "h-10 w-10"} grid place-items-center rounded-[13px] bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-[0_8px_24px_rgba(13,148,136,0.28)]`}>
        <Compass size={compact ? 18 : 20} strokeWidth={2.2} />
      </span>
      <span className="leading-none">
        <span className="font-display block text-[18px] font-extrabold tracking-[-0.04em] text-slate-950">
          Explore<span className="text-emerald-700">BD</span>
        </span>
        {!compact && (
          <span className="mt-1 block text-[8px] font-bold uppercase tracking-[0.19em] text-slate-400">
            travel with trust
          </span>
        )}
      </span>
    </span>
  );
}


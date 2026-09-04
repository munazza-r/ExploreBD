import { Check, Clock3, ShieldCheck } from "lucide-react";

export default function StatusPill({ status }) {
  const checkedIn = status === "CHECKED_IN";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] ${checkedIn ? "border-blue-200 bg-blue-50 text-blue-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
      {checkedIn ? <Check size={12} /> : status === "ACTIVE" ? <ShieldCheck size={12} /> : <Clock3 size={12} />}
      {checkedIn ? "Checked in" : status === "ACTIVE" ? "Active pass" : status}
    </span>
  );
}

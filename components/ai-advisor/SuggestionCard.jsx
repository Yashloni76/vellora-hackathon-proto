"use client";
import { TrendingUp, Scissors } from "lucide-react";

export default function SuggestionCard({ text, type, index }) {
  const isInvestment = type === "investment";

  return (
    <div
      className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 flex gap-4 items-start hover:border-[#00ff88]/30 hover:bg-[var(--bg-card-hover)] transition-all duration-200"
      style={{ borderLeft: "3px solid #00ff88" }}
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-xl bg-[#00ff8812] flex items-center justify-center flex-shrink-0 mt-0.5">
        {isInvestment ? (
          <TrendingUp size={18} className="text-[#00ff88]" />
        ) : (
          <Scissors size={18} className="text-[#00ff88]" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-[10px] font-black tracking-[0.15em] px-2 py-0.5 rounded-full ${
              isInvestment
                ? "bg-[#00ff8820] text-[#00ff88]"
                : "bg-emerald-500/10 text-emerald-400"
            }`}
          >
            {isInvestment ? "INVESTMENT" : "SAVING TIP"}
          </span>
          <span className="text-[10px] text-[var(--text-muted)] font-bold">#{String(index + 1).padStart(2, "0")}</span>
        </div>
        <p className="text-[var(--text-primary)] text-[14px] font-semibold leading-snug">{text.split(":")[0]?.trim() || text}</p>
        {text.includes(":") && (
          <p className="text-[var(--text-muted)] text-[13px] leading-relaxed opacity-70">{text.split(":").slice(1).join(":").trim()}</p>
        )}
      </div>
    </div>
  );
}

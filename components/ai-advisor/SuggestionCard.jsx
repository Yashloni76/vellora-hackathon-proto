"use client";
import { TrendingUp, Scissors, ExternalLink, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function SuggestionCard({ title, desc, type, index, comparison, links }) {
  const isInvestment = type === "investment";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-[#111311] border border-[#1a1f1a] rounded-3xl p-6 flex flex-col gap-4 hover:border-[#00ff88]/40 hover:bg-[#151a15] transition-all duration-300 group relative"
    >
      {/* Type Badge & Index */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isInvestment ? "bg-[#00ff8815] text-[#00ff88]" : "bg-emerald-500/10 text-emerald-400"
          }`}>
            {isInvestment ? <TrendingUp size={16} /> : <Scissors size={16} />}
          </div>
          <span
            className={`text-[9px] font-black tracking-[0.2em] px-2.5 py-1 rounded-full ${
              isInvestment
                ? "bg-[#00ff8815] text-[#00ff88] border border-[#00ff88]/20"
                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
            }`}
          >
            {isInvestment ? "GROWTH STRATEGY" : "SAVING HACK"}
          </span>
        </div>
        <span className="text-[10px] text-[#333] font-bold tracking-tighter group-hover:text-[#555] transition-colors">#{String(index + 1).padStart(2, "0")}</span>
      </div>

      {/* Main Content */}
      <div className="space-y-1.5">
        <h3 className="text-white text-base font-bold tracking-tight">{title}</h3>
        <p className="text-[#888] text-xs leading-relaxed font-medium">{desc}</p>
      </div>

      {/* Comparison Bubble (Smart Growth Delta) */}
      {isInvestment && comparison && (
        <div className="bg-[#00ff88]/5 border border-[#00ff88]/10 rounded-2xl p-4 space-y-2 relative overflow-hidden">
          <div className="flex items-center gap-2 text-[#00ff88]">
            <Zap size={12} fill="currentColor" />
            <span className="text-[10px] font-black tracking-widest uppercase">Growth Opportunity</span>
          </div>
          <p className="text-white/90 text-[11px] leading-relaxed font-semibold italic">
           "{comparison}"
          </p>
        </div>
      )}

      {/* Research Links */}
      {isInvestment && links && links.length > 0 && (
         <div className="pt-2 space-y-2">
            <div className="flex items-center gap-1.5 text-[#444]">
               <ShieldCheck size={11} />
               <span className="text-[9px] font-bold tracking-widest uppercase">Verified Research Sites</span>
            </div>
            <div className="flex flex-wrap gap-2">
               {links.map((link, i) => (
                  <a 
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#0a0a0a] border border-[#1a1f1a] hover:border-[#00ff88]/50 hover:bg-[#111] px-3 py-1.5 rounded-xl transition-all group/link"
                  >
                     <span className="text-[10px] font-bold text-[#666] group-hover/link:text-white transition-colors">{link.title}</span>
                     <ExternalLink size={10} className="text-[#333] group-hover/link:text-[#00ff88]" />
                  </a>
               ))}
            </div>
         </div>
      )}

      {/* Action Prompt */}
      {isInvestment && (
        <p className="text-[9px] text-[#333] font-medium pt-1 italic">
          *Always conduct independent research on the portals above before investing.
        </p>
      )}
    </motion.div>
  );
}

"use client";

import { Lock, CheckCircle2, Award, Target, TrendingUp, Zap, Trophy, Star } from "lucide-react";
import { milestones } from "@/data/dummy";
import { cn } from "@/lib/utils";

const IconMap = {
  IGNITION: Zap,
  ARCHITECT: Target,
  CENTURY: Trophy,
  ORACLE: Award,
  "BULL RUN": TrendingUp,
  TITAN: Star
};

export default function MilestoneCards() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
         <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight underline decoration-[#00ff88]/30 underline-offset-8">Architect Milestones</h2>
         <span className="text-[10px] text-[var(--text-muted)] font-bold tracking-[0.2em] uppercase">Progression Index</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {milestones.map((milestone) => (
          <MilestoneCard key={milestone.title} milestone={milestone} />
        ))}
      </div>
    </div>
  );
}

function MilestoneCard({ milestone }) {
  const Icon = IconMap[milestone.title] || Lock;
  const isUnlocked = milestone.unlocked;

  return (
    <div className={cn(
      "card p-6 flex flex-col items-center justify-center text-center space-y-4 border transition-all duration-300 relative group overflow-hidden h-48",
      isUnlocked 
        ? "bg-[var(--bg-card)] border-[var(--border)] hover:border-[#00ff88]/30 hover:bg-[var(--bg-card-hover)] transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,255,136,0.1)]" 
        : "bg-[var(--bg-primary)] border-[var(--border)] opacity-60 filter grayscale hover:grayscale-0 hover:opacity-80"
    )}>
      {/* Icon Area */}
      <div className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center relative z-10",
        isUnlocked ? "bg-[#00ff8815] text-[#00ff88]" : "bg-[var(--bg-card)] text-[var(--text-muted)]"
      )}>
        {isUnlocked ? <Icon size={24} /> : <Lock size={20} />}
      </div>

      <div className="space-y-1 relative z-10">
        <h3 className={cn(
          "text-[10px] font-black tracking-widest uppercase",
          isUnlocked ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
        )}>
          {milestone.title}
        </h3>
        <p className="text-[9px] text-[var(--text-muted)] font-bold leading-tight uppercase tracking-widest">
           {milestone.sub}
        </p>
      </div>

      {isUnlocked && (
        <div className="absolute top-2 right-2">
           <CheckCircle2 size={12} className="text-[#00ff88]" />
        </div>
      )}

      {/* Glossy overlay for unlocked */}
      {isUnlocked && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </div>
  );
}

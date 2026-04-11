"use client";

import { Zap } from "lucide-react";
import { streakData } from "@/data/dummy";

export default function ActiveStreakCard() {
  return (
    <div className="card !bg-[#00ff88] p-10 h-full flex flex-col justify-between relative overflow-hidden group hover:shadow-[0_0_60px_rgba(0,255,136,0.3)] transition-all duration-300">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-[11px] text-[var(--bg-primary)]/60 font-black tracking-[0.2em] uppercase">Active Streak</p>
          <h2 className="text-7xl font-black text-[var(--bg-primary)] tracking-tighter leading-none">
            {streakData.currentStreak} <span className="text-3xl font-bold tracking-tight">Days</span>
          </h2>
        </div>
        <div className="w-14 h-14 bg-[var(--bg-primary)] rounded-2xl flex items-center justify-center text-[#00ff88] shadow-2xl relative z-10">
          <Zap size={32} fill="currentColor" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end">
           <div className="space-y-1">
              <p className="text-[10px] text-[var(--text-muted)] font-bold tracking-widest uppercase">Next Milestone</p>
              <p className="text-sm font-black text-[var(--bg-primary)] uppercase tracking-tight">{streakData.nextMilestone} Days</p>
           </div>
           <p className="text-2xl font-black text-[var(--bg-primary)]/30 tracking-widest">{streakData.milestoneProgress}%</p>
        </div>
        
        <div className="w-full h-3 bg-[var(--bg-primary)]/10 rounded-full overflow-hidden border border-[var(--bg-primary)]/5">
           <div 
             className="h-full bg-[var(--bg-primary)] shadow-[0_0_15px_rgba(0,0,0,0.3)]" 
             style={{ width: `${streakData.milestoneProgress}%` }} 
           />
        </div>
      </div>

      {/* Decorative lightning blast effect */}
      <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/20 rounded-full blur-[60px] pointer-events-none transition-transform group-hover:scale-150 duration-700" />
      <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-[var(--bg-primary)]/5 rounded-full blur-[60px] pointer-events-none" />
    </div>
  );
}

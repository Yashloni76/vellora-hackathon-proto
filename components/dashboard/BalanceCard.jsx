"use client";

import { BarChart, Bar, ResponsiveContainer } from "recharts";
import { savingsData } from "@/data/dummy";

export default function BalanceCard({ balance = 0, dailySafe = 0, streak = 0 }) {
  return (
    <div className="card glow flex items-center justify-between p-8 bg-[#111311] border border-border-dark hover:border-[#00ff88]/30 hover:bg-[#1a1f1a] transition-all duration-200 relative overflow-hidden group">
      {/* Streak Indicator */}
      {streak > 0 && (
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20 z-20">
          <span className="text-orange-500" style={{ fontSize: '14px' }}>🔥</span>
          <span className="text-orange-500 font-bold text-xs">{streak} Week Streak</span>
        </div>
      )}

      <div className="space-y-2 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
          <span className="text-[10px] text-[#00ff88] font-bold tracking-[0.2em] uppercase">Safe to Spend</span>
        </div>
        <p className="text-muted text-xs font-medium">Remaining balance after savings goal</p>
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-white mt-1">
            ₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </h1>
          {dailySafe > 0 && (
            <p className="text-[#00ff88]/70 text-[10px] font-bold tracking-wider uppercase mt-1">
              PROJECTION: <span className="text-white">₹{dailySafe.toLocaleString("en-IN", { maximumFractionDigits: 0 })} SAFE PER DAY</span>
            </p>
          )}
        </div>
      </div>

      <div className="w-[200px] h-20 relative z-10 hidden sm:block">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={savingsData}>
            <Bar 
              dataKey="amount" 
              fill="#00ff88" 
              radius={[2, 2, 0, 0]} 
              className="opacity-80 group-hover:opacity-100 transition-opacity"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Decorative background element */}
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#00ff88]/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}

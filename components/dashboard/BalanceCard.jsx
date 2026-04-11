"use client";

import { BarChart, Bar, ResponsiveContainer } from "recharts";
import { savingsData } from "@/data/dummy";

export default function BalanceCard({ balance = 0 }) {
  return (
    <div className="card glow flex items-center justify-between p-8 bg-[var(--bg-card)] border border-[var(--border)] hover:border-[#00ff88]/30 hover:bg-[var(--bg-card-hover)] transition-all duration-200 relative overflow-hidden group">
      <div className="space-y-2 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
          <span className="text-[10px] text-[#00ff88] font-bold tracking-[0.2em] uppercase">Live Balance</span>
        </div>
        <p className="text-[var(--text-muted)] text-xs font-medium">Total Remaining Balance</p>
        <h1 className="text-4xl font-bold tracking-tight text-[var(--text-primary)] mt-1">
          ₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </h1>
      </div>

      <div className="w-[200px] h-20 relative z-10">
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

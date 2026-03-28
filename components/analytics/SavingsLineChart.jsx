"use client";

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { savingsData } from "@/data/dummy";

export default function SavingsLineChart() {
  return (
    <div className="card bg-[#111311] border border-border-dark p-8 relative overflow-hidden group h-full flex flex-col">
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight">Savings Velocity</h2>
          <p className="text-muted text-[11px] font-medium uppercase tracking-widest">
            Net accumulation over the last 6 fiscal months
          </p>
        </div>
        <div className="px-2 py-1 bg-[#00ff8815] border border-[#00ff8830] rounded text-[9px] text-[#00ff88] font-bold tracking-widest animate-pulse uppercase">
          Real-time
        </div>
      </div>

      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={savingsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#6b7280", fontSize: 10, fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#6b7280", fontSize: 10, fontWeight: 600 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "#111311", 
                border: "1px solid #1f2b1f", 
                borderRadius: "8px",
                fontSize: "12px",
                color: "#fff"
              }}
              itemStyle={{ color: "#00ff88" }}
              cursor={{ stroke: "#1f2b1f", strokeWidth: 2 }}
            />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke="#00ff88" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorSavings)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ff88]/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}

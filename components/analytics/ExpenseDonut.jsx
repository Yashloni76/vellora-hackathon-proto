"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { avoidableExpenses, unavoidableExpenses } from "@/data/dummy";

export default function ExpenseDonut() {
  const avoidableTotal = avoidableExpenses.reduce((sum, item) => sum + item.amount, 0);
  const unavoidableTotal = unavoidableExpenses.reduce((sum, item) => sum + item.amount, 0);
  const ratio = (unavoidableTotal / avoidableTotal).toFixed(1);

  const data = [
    { name: "AVOIDABLE", value: avoidableTotal, color: "#00ff88" },
    { name: "ESSENTIAL", value: unavoidableTotal, color: "#6b7280" }
  ];

  return (
    <div className="card bg-[#111311] border border-border-dark p-8 relative overflow-hidden flex flex-col h-full">
      <h2 className="text-xl font-bold text-white tracking-tight mb-8">Expense Anatomy</h2>
      
      <div className="flex-1 flex items-center justify-center gap-12">
        <div className="relative w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                startAngle={90}
                endAngle={450}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-muted font-bold tracking-[0.2em] uppercase mb-1">Ratio</span>
            <span className="text-2xl font-bold text-white tracking-tight">{ratio}:1</span>
          </div>
        </div>

        <div className="space-y-6 flex-1 max-w-[160px]">
          {data.map((entry, index) => (
            <div key={entry.name} className="space-y-1.5 group cursor-default">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-[10px] text-muted font-bold tracking-widest uppercase transition-colors group-hover:text-white">
                  {entry.name}
                </span>
              </div>
              <p className="text-lg font-bold text-white tracking-tight">
                ₹{entry.value.toLocaleString("en-IN")}
              </p>
            </div>
          ))}
          <div className="pt-6 border-t border-border-dark/50 invisible lg:visible">
             <p className="text-[9px] text-muted font-medium leading-relaxed uppercase tracking-wider">
               "Net utility density is 12% higher than prev cycle."
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

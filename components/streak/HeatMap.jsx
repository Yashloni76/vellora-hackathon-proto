"use client";

import { useMemo } from "react";

export default function HeatMap() {
  const squares = useMemo(() => {
    return Array.from({ length: 52 * 7 }).map((_, i) => ({
      opacity: Math.random() * 0.9 + 0.1,
      amount: Math.floor(Math.random() * 1000)
    }));
  }, []);

  return (
    <div className="card bg-[#111311] border border-border-dark p-8 relative overflow-hidden flex flex-col h-full group">
      <div className="flex justify-between items-start mb-10">
        <h2 className="text-xl font-bold text-white tracking-tight">Financial Contribution Map</h2>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-muted font-bold tracking-widest uppercase">Less</span>
          <div className="flex gap-1">
            {[0.1, 0.3, 0.6, 1.0].map((op) => (
              <div 
                key={op} 
                className="w-3 h-3 rounded-[2px]" 
                style={{ backgroundColor: "#00ff88", opacity: op }} 
              />
            ))}
          </div>
          <span className="text-[10px] text-muted font-bold tracking-widest uppercase">More</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="grid grid-flow-col grid-cols-[repeat(52,1fr)] grid-rows-7 gap-[3px]">
          {squares.map((data, i) => (
            <div 
              key={i} 
              className="w-full aspect-square rounded-[2px] transition-all hover:scale-150 cursor-pointer hover:z-10" 
              style={{ backgroundColor: "#00ff88", opacity: data.opacity }}
              title={`Day ${i + 1}: Saved ₹${data.amount}`}
            />
          ))}
        </div>
        
        <div className="mt-8 flex justify-between">
           {["OCT 2023", "JAN 2024", "APR 2024", "JUL 2024", "TODAY"].map(label => (
             <span key={label} className="text-[10px] text-muted font-bold tracking-widest uppercase">
               {label}
             </span>
           ))}
        </div>
      </div>

      {/* Decorative background element */}
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-[#00ff88]/5 rounded-full blur-[100px] pointer-events-none" />
    </div>
  );
}

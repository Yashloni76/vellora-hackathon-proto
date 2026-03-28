import { ArrowUpRight, PiggyBank, Meh } from "lucide-react";
import { balance } from "@/data/dummy";

export default function StatsRow() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Savings Velocity Card */}
      <div className="card bg-[#111311] border border-border-dark p-6 space-y-4 hover:border-[#00ff88]/30 hover:bg-[#1a1f1a] transition-all duration-200">
        <div className="flex justify-between items-start">
          <p className="text-[10px] text-muted font-bold tracking-[0.2em] uppercase">Savings Velocity</p>
          <div className="w-8 h-8 rounded-lg bg-[#00ff8810] flex items-center justify-center">
            <ArrowUpRight size={16} className="text-[#00ff88]" />
          </div>
        </div>
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-white">+12.4%</h2>
          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mt-2">
            <div className="w-[65%] h-full bg-[#00ff88] glow" />
          </div>
        </div>
      </div>

      {/* Saved Today Card */}
      <div className="card bg-[#111311] border border-border-dark p-6 space-y-4 hover:border-[#00ff88]/30 hover:bg-[#1a1f1a] transition-all duration-200">
        <div className="flex justify-between items-start">
          <p className="text-[10px] text-muted font-bold tracking-[0.2em] uppercase">Saving</p>
          <div className="w-8 h-8 rounded-lg bg-[#00ff8810] flex items-center justify-center">
            <PiggyBank size={16} className="text-[#00ff88]" />
          </div>
        </div>
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-white">₹{balance.toLocaleString()}.00</h2>
          <p className="text-[10px] text-[#00ff88] font-bold tracking-wider uppercase">Projected Monthly Saving</p>
        </div>
      </div>

      {/* Regret Index Card */}
      <div className="card bg-[#111311] border border-border-dark p-6 space-y-4 hover:border-[#00ff88]/30 hover:bg-[#1a1f1a] transition-all duration-200">
        <div className="flex justify-between items-start">
          <p className="text-[10px] text-muted font-bold tracking-[0.2em] uppercase">Regret Index</p>
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
            <Meh size={16} className="text-red" />
          </div>
        </div>
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-red">Low</h2>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red shadow-[0_0_8px_rgba(255,68,68,0.5)]" />
            <span className="text-[10px] text-muted font-bold tracking-wider uppercase">98% Positive Sentiment</span>
          </div>
        </div>
      </div>
    </div>
  );
}

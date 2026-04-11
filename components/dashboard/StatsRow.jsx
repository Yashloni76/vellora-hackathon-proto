'use client'

import { ArrowUpRight, PiggyBank, Meh } from "lucide-react";

export default function StatsRow({ savingsVelocity = '0.0', savings = 0, regretIndex = 'Low' }) {
  const isPositive = parseFloat(savingsVelocity) >= 0;
  
  const getRegretColor = () => {
    if (regretIndex === 'Low') return 'text-[#00ff88]';
    if (regretIndex === 'Medium') return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRegretBg = () => {
    if (regretIndex === 'Low') return 'bg-[#00ff8810]';
    if (regretIndex === 'Medium') return 'bg-yellow-500/10';
    return 'bg-red-500/10';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Savings Velocity Card */}
      <div className="card bg-[var(--bg-card)] border border-[var(--border)] p-6 space-y-4 hover:border-[#00ff88]/30 hover:bg-[var(--bg-card-hover)] transition-all duration-200">
        <div className="flex justify-between items-start">
          <p className="text-[10px] text-[var(--text-muted)] font-bold tracking-[0.2em] uppercase">Savings Velocity</p>
          <div className="w-8 h-8 rounded-lg bg-[#00ff8810] flex items-center justify-center">
            <ArrowUpRight size={16} className={isPositive ? "text-[#00ff88]" : "text-red-500"} />
          </div>
        </div>
        <div className="space-y-1">
          <h2 className={`text-3xl font-bold ${isPositive ? 'text-[var(--text-primary)]' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{savingsVelocity}%
          </h2>
          <div className="w-full h-1 bg-[var(--border)] rounded-full overflow-hidden mt-2">
            <div 
              className={`h-full ${isPositive ? 'bg-[#00ff88]' : 'bg-red-500'} glow`} 
              style={{ width: `${Math.min(Math.abs(parseFloat(savingsVelocity)), 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Saving Card */}
      <div className="card bg-[var(--bg-card)] border border-[var(--border)] p-6 space-y-4 hover:border-[#00ff88]/30 hover:bg-[var(--bg-card-hover)] transition-all duration-200">
        <div className="flex justify-between items-start">
          <p className="text-[10px] text-[var(--text-muted)] font-bold tracking-[0.2em] uppercase">Saving</p>
          <div className="w-8 h-8 rounded-lg bg-[#00ff8810] flex items-center justify-center">
            <PiggyBank size={16} className="text-[#00ff88]" />
          </div>
        </div>
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">₹{savings.toLocaleString('en-IN')}</h2>
          <p className="text-[10px] text-[#00ff88] font-bold tracking-wider uppercase">Current Month Saving</p>
        </div>
      </div>

      {/* Regret Index Card */}
      <div className="card bg-[var(--bg-card)] border border-[var(--border)] p-6 space-y-4 hover:border-[#00ff88]/30 hover:bg-[var(--bg-card-hover)] transition-all duration-200">
        <div className="flex justify-between items-start">
          <p className="text-[10px] text-[var(--text-muted)] font-bold tracking-[0.2em] uppercase">Regret Index</p>
          <div className={`w-8 h-8 rounded-lg ${getRegretBg()} flex items-center justify-center`}>
            <Meh size={16} className={getRegretColor()} />
          </div>
        </div>
        <div className="space-y-1">
          <h2 className={`text-3xl font-bold ${getRegretColor()}`}>{regretIndex}</h2>
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${regretIndex === 'Low' ? 'bg-[#00ff88]' : regretIndex === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'} shadow-lg`} />
            <span className="text-[10px] text-[var(--text-muted)] font-bold tracking-wider uppercase">Sentiment Analysis</span>
          </div>
        </div>
      </div>
    </div>
  );
}

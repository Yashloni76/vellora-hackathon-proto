'use client'

import { ArrowUpRight, PiggyBank, Meh } from "lucide-react";

export default function StatsRow({ savingsVelocity = '0.0', savings = 0, regretIndex = 'Low', weeklySaved = 0, weeklyGoal = 0 }) {
  const isHealthy = parseFloat(savingsVelocity) <= 100;
  const isWeeklySuccess = weeklySaved >= weeklyGoal;
  
  const getStatusColor = () => {
    if (regretIndex === 'On Track') return 'text-[#00ff88]';
    if (regretIndex === 'Warning') return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusBg = () => {
    if (regretIndex === 'On Track') return 'bg-[#00ff8810]';
    if (regretIndex === 'Warning') return 'bg-yellow-500/10';
    return 'bg-red-500/10';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Spending Progress Card */}
      <div className="card bg-[#111311] border border-border-dark p-6 space-y-4 hover:border-[#00ff88]/30 hover:bg-[#1a1f1a] transition-all duration-200">
        <div className="flex justify-between items-start">
          <p className="text-[10px] text-muted font-bold tracking-[0.2em] uppercase">Spending Progress</p>
          <div className="w-8 h-8 rounded-lg bg-[#00ff8810] flex items-center justify-center">
            <ArrowUpRight size={16} className={isHealthy ? "text-[#00ff88]" : "text-red-500"} />
          </div>
        </div>
        <div className="space-y-1">
          <h2 className={`text-3xl font-bold ${isHealthy ? 'text-white' : 'text-red-500'}`}>
            {savingsVelocity}%
          </h2>
          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mt-2">
            <div 
              className={`h-full ${isHealthy ? 'bg-[#00ff88]' : 'bg-red-500'} glow`} 
              style={{ width: `${Math.min(parseFloat(savingsVelocity), 100)}%` }}
            />
          </div>
          <p className="text-[9px] text-muted mt-2 uppercase tracking-tighter">Budget Utilization</p>
        </div>
      </div>

      {/* Weekly Status Card */}
      <div className="card bg-[#111311] border border-border-dark p-6 space-y-4 hover:border-[#00ff88]/30 hover:bg-[#1a1f1a] transition-all duration-200">
        <div className="flex justify-between items-start">
          <p className="text-[10px] text-muted font-bold tracking-[0.2em] uppercase">Weekly Health</p>
          <div className="w-8 h-8 rounded-lg bg-[#00ff8810] flex items-center justify-center">
            <PiggyBank size={16} className={isWeeklySuccess ? "text-[#00ff88]" : "text-yellow-500"} />
          </div>
        </div>
        <div className="space-y-1">
          <h2 className={`text-3xl font-bold ${isWeeklySuccess ? 'text-[#00ff88]' : 'text-white'}`}>
            ₹{weeklySaved.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </h2>
          <p className="text-[10px] text-muted font-bold tracking-wider uppercase">
            Captured Savings <span className={isWeeklySuccess ? "text-[#00ff88]" : "text-yellow-500"}>
              ({isWeeklySuccess ? 'MATCHED' : 'LOW'})
            </span>
          </p>
        </div>
      </div>

      {/* Account Status Card */}
      <div className="card bg-[#111311] border border-border-dark p-6 space-y-4 hover:border-[#00ff88]/30 hover:bg-[#1a1f1a] transition-all duration-200">
        <div className="flex justify-between items-start">
          <p className="text-[10px] text-muted font-bold tracking-[0.2em] uppercase">Account Status</p>
          <div className={`w-8 h-8 rounded-lg ${getStatusBg()} flex items-center justify-center`}>
            <Meh size={16} className={getStatusColor()} />
          </div>
        </div>
        <div className="space-y-1">
          <h2 className={`text-3xl font-bold ${getStatusColor()}`}>{regretIndex}</h2>
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${regretIndex === 'On Track' ? 'bg-[#00ff88]' : regretIndex === 'Warning' ? 'bg-yellow-500' : 'bg-red-500'} shadow-lg`} />
            <span className="text-[10px] text-muted font-bold tracking-wider uppercase">Risk Evaluation</span>
          </div>
        </div>
      </div>
    </div>
  );
}

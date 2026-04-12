"use client";

import { useState, useMemo, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { motion, useSpring, useTransform, animate } from "framer-motion";
import { TrendingUp, Wallet, MinusCircle, PlusCircle, ShieldCheck } from "lucide-react";

import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'

export default function WhatIfSlider() {
  const { user } = useAuth()
  const [income, setIncome] = useState(0);
  const [unavoidable, setUnavoidable] = useState(0);
  const [initialAvoidable, setInitialAvoidable] = useState(0);
  const [avoidable, setAvoidable] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimData = async () => {
      if (!user) return;
      setLoading(true);

      // 1. Fetch Income
      const { data: userData } = await supabase
        .from('users')
        .select('income')
        .eq('id', user.id)
        .single();
      
      const realIncome = Number(userData?.income) || 0;
      setIncome(realIncome);

      // 2. Fetch Expenses to calculate averages
      const { data: expData } = await supabase
        .from('expenses')
        .select('amount, type')
        .eq('user_id', user.id);

      if (expData && expData.length > 0) {
        // Calculate monthly average
        // For simplicity, we sum per type and divide by months active (or at least 1)
        const unavoidableTotal = expData
          .filter(e => e.type === 'unavoidable')
          .reduce((sum, e) => sum + Number(e.amount), 0);
        
        const avoidableTotal = expData
          .filter(e => e.type === 'avoidable')
          .reduce((sum, e) => sum + Number(e.amount), 0);

        // We assume 1 month for now as a baseline, but ideally would calculate distinct months
        setUnavoidable(unavoidableTotal);
        setInitialAvoidable(avoidableTotal);
        setAvoidable(avoidableTotal);
      } else {
        setUnavoidable(0);
        setInitialAvoidable(2000); // Sensible default for a new user
        setAvoidable(2000);
      }

      setLoading(false);
    };

    fetchSimData();
  }, [user]);

  const savings = income - unavoidable - avoidable;
  const yearlySavings = savings * 12;
  const fiveYear = Math.round(yearlySavings * 5 * 1.08);

  const chartData = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      month: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][i],
      amount: Math.max(0, savings * (i + 1))
    }));
  }, [savings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="w-8 h-8 border-4 border-[#00ff88] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <SummaryCard label="Income" value={income} color="text-white" />
         <SummaryCard label="Unavoidable" value={unavoidable} color="text-white" />
         <SummaryCard 
           label="Avoidable" 
           value={avoidable} 
           color="text-yellow-400 font-black animate-pulse shadow-[0_0_15px_rgba(250,204,21,0.2)]" 
         />
         <SummaryCard 
           label="Net Savings" 
           value={savings} 
           color={savings >= 0 ? "text-[#00ff88]" : "text-red-500"} 
         />
      </div>

      {/* Main Slider Section */}
      <div className="card bg-[#111311] border border-border-dark p-12 relative overflow-hidden group">
         <div className="flex justify-between items-center mb-12">
            <div className="space-y-1">
               <h2 className="text-2xl font-black text-white tracking-tight uppercase italic flex items-center gap-3">
                 <MinusCircle className="text-[#00ff88]" />
                 Avoidable Spending
               </h2>
               <p className="text-muted text-[11px] font-bold tracking-widest uppercase italic">Dial back non-essentials to accelerate wealth.</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center text-[#00ff88] animate-bounce">
               <TrendingUp size={24} />
            </div>
         </div>

          <div className="space-y-8 relative z-10">
            <div className="flex justify-between items-center px-2">
               <span className="text-[10px] text-muted font-black tracking-widest uppercase opacity-50">₹0</span>
               <span className="text-[10px] text-muted font-black tracking-widest uppercase opacity-50">₹{(initialAvoidable * 2 || 10000).toLocaleString()}</span>
            </div>
            
            <input 
              type="range" 
              min="0" 
              max={initialAvoidable * 2 || 10000} 
              step="100"
              value={avoidable} 
              onChange={(e) => setAvoidable(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-900 rounded-full appearance-none cursor-pointer accent-[#00ff88] hover:accent-[#00ff88]/80 transition-all focus:outline-none"
              style={{
                background: `linear-gradient(to right, #00ff88 ${(avoidable / (initialAvoidable * 2 || 10000)) * 100}%, #111827 ${(avoidable / (initialAvoidable * 2 || 10000)) * 100}%)`
              }}
            />

            <div className="text-center pt-8">
               <div className="inline-block relative">
                  <AnimatedNumber value={avoidable} className="text-7xl font-black text-[#00ff88] tracking-tighter" prefix="₹" />
                  <div className="absolute -right-8 top-0 text-[#00ff88]/30 animate-ping">
                     <ShieldCheck size={20} />
                  </div>
               </div>
               <p className="text-[10px] text-muted font-bold tracking-[0.3em] uppercase mt-2">Adjusted Spending Target</p>
            </div>
         </div>

         {/* Backdrop decorative blast */}
         <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#00ff88]/5 rounded-full blur-[100px] pointer-events-none" />
      </div>

      {/* Projections Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <ProjectionCard 
           label="Monthly Savings" 
           value={savings} 
         />
         <ProjectionCard 
           label="Yearly Savings" 
           value={yearlySavings} 
         />
         <ProjectionCard 
           label="5 Year Projection" 
           value={fiveYear} 
           subtitle="est. 8% returns"
           highlight
         />
      </div>

      {/* Area Chart: Cumulative Savings */}
      <div className="card bg-[#111311] border border-border-dark p-8 h-[400px]">
         <div className="flex justify-between items-start mb-8">
            <div className="space-y-1">
               <h3 className="text-lg font-bold text-white tracking-tight">Cumulative Growth Curve</h3>
               <p className="text-muted text-[10px] font-bold tracking-widest uppercase italic">12-Month Projection based on current logic</p>
            </div>
            <div className="px-3 py-1 bg-gray-900 border border-border-dark rounded-full text-[9px] font-bold text-[#00ff88] uppercase tracking-widest">
              Live Forecast
            </div>
         </div>
         <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSavingsSim" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ff88" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "#4b5563", fontSize: 10, fontWeight: 700 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "#4b5563", fontSize: 10, fontWeight: 700 }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#111311", border: "1px solid #1f2b1f", borderRadius: "12px", fontSize: "11px", color: "#fff" }}
                    itemStyle={{ color: "#00ff88" }}
                    cursor={{ stroke: "#00ff88", strokeWidth: 1, strokeDasharray: "4 4" }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#00ff88" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorSavingsSim)" 
                    animationDuration={1000}
                  />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div className="card bg-[#111311] border border-border-dark p-6 flex flex-col justify-between group hover:border-[#00ff8830] transition-colors">
       <span className="text-[10px] text-muted font-black tracking-widest uppercase">{label}</span>
       <h4 className={`text-2xl font-black mt-2 tracking-tighter ${color}`}>
         ₹{value.toLocaleString()}
       </h4>
    </div>
  );
}

function ProjectionCard({ label, value, subtitle, highlight }) {
  return (
    <div className={`card p-8 flex flex-col justify-between h-48 relative overflow-hidden group transition-all duration-500 ${highlight ? "bg-black border-[#00ff8830] hover:border-[#00ff8850]" : "bg-[#111311] border-border-dark"}`}>
       <div className="space-y-1 relative z-10">
          <span className="text-[10px] text-muted font-bold tracking-[0.2em] uppercase">{label}</span>
          <div className="flex items-center gap-2">
             <AnimatedNumber value={value} className="text-3xl font-black text-white tracking-tighter" prefix="₹" />
             <PlusCircle size={16} className="text-[#00ff88]/30 group-hover:text-[#00ff88] transition-colors" />
          </div>
       </div>
       
       {subtitle && (
         <p className="text-[9px] text-muted font-black uppercase tracking-widest relative z-10 italic mt-2">
           {subtitle}
         </p>
       )}

       <div className="flex self-end mt-auto text-[#00ff8810] group-hover:text-[#00ff8820 transition-colors">
          <Wallet size={48} strokeWidth={1} />
       </div>

       {highlight && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ff88]/5 rounded-full blur-[60px] pointer-events-none" />
       )}
    </div>
  );
}

function AnimatedNumber({ value, className, prefix = "" }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const controls = animate(displayValue, value, {
      duration: 0.8,
      onUpdate: (latest) => setDisplayValue(Math.round(latest))
    });
    return () => controls.stop();
  }, [value]);

  return (
    <span className={className}>
      {prefix}{displayValue.toLocaleString()}
    </span>
  );
}

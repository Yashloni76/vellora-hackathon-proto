'use client'
import { useState, useEffect } from "react";
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from "framer-motion";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  RadialBarChart, 
  RadialBar, 
  Cell,
  Tooltip 
} from "recharts";
import { Calendar, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import SavingsLineChart from "@/components/analytics/SavingsLineChart";
import ExpenseDonut from "@/components/analytics/ExpenseDonut";
import { categoryData } from "@/data/dummy";

export default function AnalyticsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading])

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
      <div className="text-[#00ff88] text-xl">Loading...</div>
    </div>
  )

  if (!user) return null

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }}
      className="p-12 space-y-12 pb-24 relative min-h-screen"
    >
      {/* Header */}
      <header className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">Visual Analytics</h1>
            <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] mt-2 shadow-[0_0_8px_rgba(0,255,136,0.6)]" />
          </div>
          <p className="text-muted text-sm font-medium uppercase tracking-widest">
            Detailed performance breakdown of your student financial arc.
          </p>
        </div>

        <div className="bg-[#111311] border border-border-dark px-4 py-3 rounded-xl flex items-center gap-4 group hover:border-[#00ff8830] transition-colors">
          <div className="w-8 h-8 rounded-lg bg-gray-900 border border-border-dark flex items-center justify-center text-muted group-hover:text-[#00ff88] transition-colors">
            <Calendar size={16} />
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted font-bold tracking-widest uppercase">Current Cycle</p>
            <p className="text-[12px] font-bold text-white tracking-tight uppercase">Q3 Performance</p>
          </div>
        </div>
      </header>

      {/* Top Row: Line + Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        <SavingsLineChart />
        <SavingsRateGauge />
      </div>

      {/* Middle Row: Donut + Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ExpenseDonut />
        <CategoryDistribution />
      </div>
    </motion.div>
  );
}

function SavingsRateGauge() {
  const data = [
    { name: "Rate", value: 64, fill: "#00ff88" }
  ];

  return (
    <div className="card bg-[#111311] border border-border-dark p-8 relative overflow-hidden flex flex-col h-full group">
       <div className="space-y-1 mb-8">
          <h2 className="text-xl font-bold text-white tracking-tight">Savings Rate</h2>
          <p className="text-muted text-[11px] font-medium uppercase tracking-widest">Efficiency index</p>
       </div>

       <div className="flex-1 relative flex items-center justify-center">
          <div className="w-56 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="80%" 
                outerRadius="100%" 
                barSize={12} 
                data={data} 
                startAngle={225} 
                endAngle={-45}
              >
                <RadialBar
                  minAngle={15}
                  background={{ fill: "#1a1f1a" }}
                  clockWise
                  dataKey="value"
                  cornerRadius={10}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-4">
            <span className="text-5xl font-bold text-white tracking-tighter shadow-sm">64%</span>
            <span className="text-[10px] text-muted font-bold tracking-widest uppercase mt-2">Active Ratio</span>
          </div>
       </div>

       <div className="mt-8 space-y-4 pt-8 border-t border-border-dark/50">
          <p className="text-[11px] text-muted leading-relaxed font-medium">
            You are <span className="text-[#00ff88] font-bold">14% ahead</span> of your quarterly student liquidity target.
          </p>
          <button className="w-full bg-[#1a1f1a] border border-border-dark text-white text-[10px] font-bold tracking-widest uppercase py-3 rounded-lg hover:border-[#00ff88] transition-colors cursor-pointer">
            Recalrate Goal
          </button>
       </div>
    </div>
  );
}

function CategoryDistribution() {
  return (
    <div className="card bg-[#111311] border border-border-dark p-8 relative overflow-hidden flex flex-col h-full group">
       <div className="flex justify-between items-start mb-8">
          <div className="space-y-1">
             <h2 className="text-xl font-bold text-white tracking-tight">Category Distribution</h2>
             <p className="text-muted text-[11px] font-medium uppercase tracking-widest">Sector-wise audit</p>
          </div>
          <div className="bg-gray-900 border border-border-dark rounded-lg p-1 flex">
             <button className="px-3 py-1 bg-[#1a1f1a] text-[#00ff88] text-[9px] font-bold rounded shadow-sm tracking-widest uppercase">Monthly View</button>
          </div>
       </div>

       <div className="flex-1 w-full min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
             <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#6b7280", fontSize: 10, fontWeight: 600 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#6b7280", fontSize: 10, fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#111311", border: "1px solid #1f2b1f", borderRadius: "8px", fontSize: "11px", color: "#fff" }}
                  itemStyle={{ color: "#00ff88" }}
                  cursor={{ fill: "#1a1f1a" }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                >
                  {categoryData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 0 ? "#00ff88" : "#1a1f1a"} 
                      stroke={index === 0 ? "none" : "#1f2b1f"}
                      className="hover:fill-[#00ff88] transition-all cursor-pointer"
                    />
                  ))}
                </Bar>
             </BarChart>
          </ResponsiveContainer>
       </div>
    </div>
  );
}


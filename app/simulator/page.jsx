'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { useRouter } from 'next/navigation'

import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import WhatIfSlider from '@/components/simulator/WhatIfSlider'

export default function SimulatorPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [income, setIncome] = useState(0)
  const [unavoidable, setUnavoidable] = useState(0)
  const [avoidableTotal, setAvoidableTotal] = useState(0)
  
  const [avoidable, setAvoidable] = useState(0)
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('income')
          .eq('id', user.id)
          .single()

        if (userError) throw userError

        const { data: expenses, error: expensesError } = await supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id)

        if (expensesError) throw expensesError

        const unav = expenses.filter(e => e.type === 'unavoidable').reduce((sum, e) => sum + Number(e.amount), 0)
        const av = expenses.filter(e => e.type === 'avoidable').reduce((sum, e) => sum + Number(e.amount), 0)

        setIncome(Number(userData.income || 0))
        setUnavoidable(unav)
        setAvoidableTotal(av)
        
        // Initialize the slider's starting position to the user's actual avoidable spend
        setAvoidable(av)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to fetch simulator data.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const savings = income - unavoidable - avoidable
  const yearlySavings = savings * 12
  const fiveYear = Math.round(yearlySavings * 5 * 1.08)

  const chartData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return Array.from({ length: 12 }, (_, i) => ({
      month: months[i],
      savings: savings * (i + 1)
    }))
  }, [savings])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary">
         <div className="w-10 h-10 border-4 border-border-dark border-t-[#00ff88] rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary">
        <div className="text-[#ff4444] font-bold text-lg">{error}</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-12 space-y-12 pb-24 relative min-h-screen"
    >
      <header className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-primary uppercase italic">
          What-If Simulator
        </h1>
        <p className="text-[#6b7280] text-sm font-bold uppercase tracking-widest italic opacity-80">
          Adjust parameters to visualize your trajectory
        </p>
      </header>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard label="MONTHLY INCOME" value={income} />
        <SummaryCard label="UNAVOIDABLE COSTS" value={unavoidable} />
        <SummaryCard label="AVOIDABLE SPEND" value={avoidable} />
        <SummaryCard label="MONTHLY SAVINGS" value={savings} isSavings />
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <WhatIfSlider 
          label="Adjust Avoidable Spending"
          subtext="Simulate cutting back on non-essentials"
          min={0}
          max={Math.max(avoidableTotal, 10000)}
          step={100}
          value={avoidable}
          onChange={setAvoidable}
          displayValue={`₹${avoidable.toLocaleString('en-IN')}`}
          accentColor="#00ff88"
        />
      </div>

      {/* Analytics Visualization Section */}
      <div className="bg-card border border-border-dark rounded-xl p-8 space-y-8 relative overflow-hidden group">
        <h3 className="text-lg font-bold text-primary tracking-tight">Cumulative Growth Curve</h3>
        
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff88" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 600 }} 
                dy={10} 
              />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: "#111311", border: "1px solid #1f2b1f", borderRadius: "8px", color: "#fff" }}
                itemStyle={{ color: "#00ff88", fontWeight: "bold" }}
                formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, "Accumulated Savings"]}
                labelStyle={{ color: "#6b7280" }}
              />
              <Area 
                type="monotone" 
                dataKey="savings" 
                stroke="#00ff88" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorSavings)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Highlight 5-year Box */}
        <div className="border border-green-accent rounded-xl p-6 text-center bg-primary shadow-[0_0_20px_rgba(0,255,136,0.1)]">
           <h3 className="text-primary text-lg font-bold mb-2">In 5 years, you could save</h3>
           <motion.div 
             key={fiveYear}
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.3 }}
           >
             <p className="text-5xl font-black text-green-accent tracking-tighter shadow-sm mb-2">
                ₹{Math.max(fiveYear, 0).toLocaleString('en-IN')}
             </p>
           </motion.div>
           <p className="text-[#6b7280] text-sm uppercase tracking-widest font-bold">(at 8% growth)</p>
        </div>
      </div>

    </motion.div>
  )
}

function SummaryCard({ label, value, isSavings = false }) {
  const isNegative = value < 0;
  // Apply the specific negative clamping/coloring requested
  const valueColor = isSavings 
    ? (isNegative ? 'text-[#ff4444]' : 'text-green-accent') 
    : 'text-[#ffffff]';

  return (
    <div className="bg-card border border-border-dark p-6 rounded-xl space-y-2">
      <h3 className="text-[#6b7280] text-[10px] font-black tracking-widest uppercase">{label}</h3>
      <motion.div 
        key={value}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p className={`text-3xl font-black tracking-tighter ${valueColor}`}>
          ₹{value.toLocaleString('en-IN')}
        </p>
      </motion.div>
    </div>
  )
}

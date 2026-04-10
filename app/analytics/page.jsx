'use client'
import { useState, useEffect } from "react";
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase"

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
import { Calendar } from "lucide-react";
import SavingsLineChart from "@/components/analytics/SavingsLineChart";
import ExpenseDonut from "@/components/analytics/ExpenseDonut";

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [savingsData, setSavingsData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [avoidableTotal, setAvoidableTotal] = useState(0)
  const [unavoidableTotal, setUnavoidableTotal] = useState(0)
  const [savingsRate, setSavingsRate] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading])

  useEffect(() => {
    if (!user) return
    fetchAnalyticsData()
  }, [user])

  const fetchAnalyticsData = async () => {
    setLoading(true)

    // Fetch all expenses for user
    const { data: expenses } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    // Fetch all income for user
    const { data: incomeData } = await supabase
      .from('income')
      .select('*')
      .eq('user_id', user.id)

    // Process category totals
    const categoryMap = {}
    expenses?.forEach(exp => {
      const cat = exp.category || 'Other'
      categoryMap[cat] = (categoryMap[cat] || 0) + exp.amount
    })
    const processedCategoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }))
    setCategoryData(processedCategoryData)

    // Process avoidable vs unavoidable
    const avoidable = expenses?.filter(e => e.type === 'avoidable').reduce((sum, e) => sum + e.amount, 0) || 0
    const unavoidable = expenses?.filter(e => e.type === 'unavoidable').reduce((sum, e) => sum + e.amount, 0) || 0
    setAvoidableTotal(avoidable)
    setUnavoidableTotal(unavoidable)

    // Process monthly savings
    const monthlyExpenses = {}
    expenses?.forEach(exp => {
      const month = new Date(exp.created_at || new Date()).toLocaleString('default', { month: 'short' }).toUpperCase()
      monthlyExpenses[month] = (monthlyExpenses[month] || 0) + exp.amount
    })

    const monthlyIncome = {}
    incomeData?.forEach(inc => {
      monthlyIncome[inc.month] = (monthlyIncome[inc.month] || 0) + inc.amount
    })

    const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"]
    const savings = months
      .filter(m => monthlyIncome[m] || monthlyExpenses[m])
      .map(m => ({
        month: m,
        amount: Math.max(0, (monthlyIncome[m] || 0) - (monthlyExpenses[m] || 0))
      }))
    setSavingsData(savings)

    // Savings rate
    const totalIncome = incomeData?.reduce((sum, i) => sum + i.amount, 0) || 0
    const totalExpenses = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0
    const rate = totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0
    setSavingsRate(rate)

    setLoading(false)
  }

  if (loading || authLoading) return (
    <div className="px-10 pt-8">
      <div className="h-8 w-64 bg-[#1a1f1a] rounded animate-pulse mb-8" />
      <div className="grid grid-cols-2 gap-6">
        <div className="h-64 bg-[#111311] rounded-xl animate-pulse" />
        <div className="h-64 bg-[#111311] rounded-xl animate-pulse" />
        <div className="h-64 bg-[#111311] rounded-xl animate-pulse" />
        <div className="h-64 bg-[#111311] rounded-xl animate-pulse" />
      </div>
    </div>
  )

  if (!loading && categoryData.length === 0) return (
    <div className="px-10 pt-8 flex flex-col items-center justify-center h-64 text-center">
      <p className="text-[#6b7280] text-sm">No expense data yet.</p>
      <p className="text-[#00ff88] text-xs mt-2">Add expenses from the dashboard to see analytics.</p>
    </div>
  )

  if (!user) return null

  const ratio = avoidableTotal > 0 ? (unavoidableTotal / avoidableTotal).toFixed(1) : '0';

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
        <SavingsLineChart savingsData={savingsData} />
        <SavingsRateGauge rate={savingsRate} />
      </div>

      {/* Middle Row: Donut + Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ExpenseDonut 
          avoidableTotal={avoidableTotal} 
          unavoidableTotal={unavoidableTotal} 
          ratio={ratio} 
        />
        <CategoryDistribution data={categoryData} />
      </div>
    </motion.div>
  );
}

function SavingsRateGauge({ rate }) {
  const data = [
    { name: "Rate", value: rate, fill: "#00ff88" }
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
            <span className="text-5xl font-bold text-white tracking-tighter shadow-sm">{rate}%</span>
            <span className="text-[10px] text-muted font-bold tracking-widest uppercase mt-2">Active Ratio</span>
          </div>
       </div>

       <div className="mt-8 space-y-4 pt-8 border-t border-border-dark/50">
          <p className="text-[11px] text-muted leading-relaxed font-medium">
            Your savings efficiency is currently at <span className="text-[#00ff88] font-bold">{rate}%</span>.
          </p>
          <button className="w-full bg-[#1a1f1a] border border-border-dark text-white text-[10px] font-bold tracking-widest uppercase py-3 rounded-lg hover:border-[#00ff88] transition-colors cursor-pointer">
            Recalibrate Goal
          </button>
       </div>
    </div>
  );
}

function CategoryDistribution({ data }) {
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
             <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
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
                  {data.map((entry, index) => (
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


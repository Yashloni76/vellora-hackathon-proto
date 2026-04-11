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

  const [velocityView, setVelocityView] = useState('monthly')
  const [rawExpenses, setRawExpenses] = useState([])
  const [rawIncome, setRawIncome] = useState([])
  const [totalIncome, setTotalIncome] = useState(0)
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [goalTarget, setGoalTarget] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading])

  useEffect(() => {
    if (!user) return
    const unsub = fetchAnalyticsData()
    return () => { if (unsub) unsub() }
  }, [user])

  const fetchAnalyticsData = async () => {
    setLoading(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    // Fetch all expenses for user
    const { data: expensesData, error: expError } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', session.user.id)
      .order('date', { ascending: true })

    // Fetch all income records
    const { data: incomeRecords, error: incError } = await supabase
      .from('income')
      .select('*')
      .eq('user_id', session.user.id)
    
    // Gracefully handle if table doesn't exist yet
    if (incError && incError.code !== 'PGRST205') {
       console.error('Income table fetch error:', incError)
    }

    // Fetch primary income from users table (fallback)
    const { data: userData } = await supabase
      .from('users')
      .select('income')
      .eq('id', session.user.id)
      .single()

    const expenses = expensesData || []
    const income = incomeRecords || []
    const primaryIncome = Number(userData?.income) || 0

    setRawExpenses(expenses)
    setRawIncome(income)

    // Category totals
    const categoryMap = {}
    expenses.forEach(exp => {
      const cat = exp.category && exp.category.trim() !== ''
        ? exp.category
        : exp.type === 'avoidable' ? 'Avoidable' : 'Essential'
      categoryMap[cat] = (categoryMap[cat] || 0) + Number(exp.amount)
    })
    setCategoryData(Object.entries(categoryMap).map(([name, value]) => ({ name, value })))

    // Avoidable vs unavoidable
    const avoidable = expenses.filter(e => e.type === 'avoidable').reduce((sum, e) => sum + e.amount, 0)
    const unavoidable = expenses.filter(e => e.type === 'unavoidable').reduce((sum, e) => sum + e.amount, 0)
    setAvoidableTotal(avoidable)
    setUnavoidableTotal(unavoidable)

    const MONTH_MAP = {
      january: 'JAN', february: 'FEB', march: 'MAR', april: 'APR',
      may: 'MAY', june: 'JUN', july: 'JUL', august: 'AUG',
      september: 'SEP', october: 'OCT', november: 'NOV', december: 'DEC',
      jan: 'JAN', feb: 'FEB', mar: 'MAR', apr: 'APR',
      jun: 'JUN', jul: 'JUL', aug: 'AUG', sep: 'SEP',
      oct: 'OCT', nov: 'NOV', dec: 'DEC'
    }

    const normalizeMonth = (val) => {
      if (!val) return null
      const lower = val.toString().trim().toLowerCase()
      // Map 'april' -> 'APR', etc.
      if (MONTH_MAP[lower]) return MONTH_MAP[lower]
      // Fallback: take first 3 chars and uppercase
      return lower.slice(0, 3).toUpperCase()
    }

    // Monthly expenses — from date field like "2025-04-10"
    const monthlyExpenses = {}
    expenses.forEach(exp => {
      const month = new Date(exp.date + 'T00:00:00')
        .toLocaleString('en-US', { month: 'short' })
        .toUpperCase()
      monthlyExpenses[month] = (monthlyExpenses[month] || 0) + Number(exp.amount)
    })

    // Monthly income — normalize from whatever format it's stored in
    const monthlyIncome = {}
    
    // If we have records in income table, use them
    income.forEach(inc => {
      let month = null
      if (inc.month) {
        month = normalizeMonth(inc.month)
      } else if (inc.created_at) {
        month = new Date(inc.created_at)
          .toLocaleString('en-US', { month: 'short' })
          .toUpperCase()
      }
      if (month) {
        monthlyIncome[month] = (monthlyIncome[month] || 0) + Number(inc.amount)
      }
    })

    // BUG FIX: If no income records are found (or table missing), 
    // attribute primary income to the current month
    const currentMonth = new Date().toLocaleString('en-US', { month: 'short' }).toUpperCase()
    if (Object.keys(monthlyIncome).length === 0 && primaryIncome > 0) {
      monthlyIncome[currentMonth] = primaryIncome
    }

    // Sort months chronologically for the graph
    const monthOrder = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
    const allMonths = [...new Set([...Object.keys(monthlyIncome), ...Object.keys(monthlyExpenses)])]
    
    // Baseline logic: If we only have data for one month, add the previous month at 0 
    // so the graph isn't a single "floating" point.
    if (allMonths.length === 1) {
      const singleMonth = allMonths[0]
      const idx = monthOrder.indexOf(singleMonth)
      if (idx > 0) {
        allMonths.unshift(monthOrder[idx - 1])
      }
    }

    allMonths.sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b))

    const savings = allMonths.map(m => ({
      month: m,
      amount: Math.max(0, (monthlyIncome[m] || 0) - (monthlyExpenses[m] || 0))
    }))

    // Make savings cumulative
    let cumulative = 0
    const cumulativeSavings = savings.map(s => {
      cumulative += s.amount
      return { month: s.month, amount: cumulative }
    })
    setSavingsData(cumulativeSavings)

    // Savings rate
    const totalIncomeFromRecords = income.reduce((sum, i) => sum + Number(i.amount), 0)
    const totalInc = totalIncomeFromRecords > 0 ? totalIncomeFromRecords : primaryIncome
    setTotalIncome(totalInc)
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
    
    const rate = totalInc > 0
      ? Math.round(((totalInc - totalExpenses) / totalInc) * 100)
      : 0
    setSavingsRate(rate)

    setLoading(false)

    // Auto refresh when expenses change
    const subscription = supabase
      .channel('expenses-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'expenses',
        filter: `user_id=eq.${session.user.id}`
      }, () => {
        fetchAnalyticsData()
      })
      .subscribe()

    return () => supabase.removeChannel(subscription)
  }

  const getFilteredSavingsData = () => {
    if (velocityView === 'monthly') return savingsData

    // Calculate total monthly income per month key
    const monthlyIncomeMap = {}
    rawIncome.forEach(inc => {
      let month = null
      if (inc.month) {
        month = inc.month.trim().toUpperCase().slice(0, 3)
      } else if (inc.created_at) {
        month = new Date(inc.created_at)
          .toLocaleString('en-US', { month: 'short' })
          .toUpperCase()
      }
      if (month) {
        monthlyIncomeMap[month] = (monthlyIncomeMap[month] || 0) + Number(inc.amount)
      }
    })

    if (velocityView === 'weekly') {
      const weeklyExpenses = {}
      rawExpenses.forEach(exp => {
        const date = new Date(exp.date + 'T00:00:00')
        const monthKey = date.toLocaleString('en-US', { month: 'short' }).toUpperCase()
        const weekNum = Math.ceil(date.getDate() / 7)
        const weekKey = `W${weekNum} ${date.toLocaleString('en-US', { month: 'short' })}`
        if (!weeklyExpenses[weekKey]) {
          weeklyExpenses[weekKey] = { spent: 0, monthKey }
        }
        weeklyExpenses[weekKey].spent += Number(exp.amount)
      })

      // Count weeks per month to distribute income
      const weeksPerMonth = {}
      Object.values(weeklyExpenses).forEach(({ monthKey }) => {
        weeksPerMonth[monthKey] = (weeksPerMonth[monthKey] || 0) + 1
      })

      let cum = 0
      return Object.entries(weeklyExpenses).map(([weekKey, { spent, monthKey }]) => {
        const monthIncome = monthlyIncomeMap[monthKey] || 0
        const weekCount = weeksPerMonth[monthKey] || 1
        const weeklyIncome = monthIncome / weekCount
        cum += Math.max(0, weeklyIncome - spent)
        return {
          month: weekKey,
          amount: cum
        }
      })
    }

    if (velocityView === 'daily') {
      const dailyExpenses = {}
      rawExpenses.forEach(exp => {
        const date = new Date(exp.date + 'T00:00:00')
        const monthKey = date.toLocaleString('en-US', { month: 'short' }).toUpperCase()
        const dayKey = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
        if (!dailyExpenses[dayKey]) {
          dailyExpenses[dayKey] = { spent: 0, monthKey }
        }
        dailyExpenses[dayKey].spent += Number(exp.amount)
      })

      // Count days per month to distribute income
      const daysPerMonth = {}
      Object.values(dailyExpenses).forEach(({ monthKey }) => {
        daysPerMonth[monthKey] = (daysPerMonth[monthKey] || 0) + 1
      })

      let cum = 0
      return Object.entries(dailyExpenses).map(([dayKey, { spent, monthKey }]) => {
        const monthIncome = monthlyIncomeMap[monthKey] || 0
        const dayCount = daysPerMonth[monthKey] || 1
        const dailyIncome = monthIncome / dayCount
        cum += Math.max(0, dailyIncome - spent)
        return {
          month: dayKey,
          amount: cum
        }
      })
    }

    return savingsData
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
        <SavingsLineChart 
          savingsData={getFilteredSavingsData()} 
          velocityView={velocityView} 
          setVelocityView={setVelocityView} 
        />
        <SavingsRateGauge 
          rate={savingsRate} 
          setShowGoalModal={setShowGoalModal}
          showGoalModal={showGoalModal}
          goalTarget={goalTarget}
          setGoalTarget={setGoalTarget}
        />
      </div>

      {/* Middle Row: Donut + Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ExpenseDonut 
          avoidableTotal={avoidableTotal} 
          unavoidableTotal={unavoidableTotal} 
          savingsAmount={totalIncome - (avoidableTotal + unavoidableTotal)}
          ratio={unavoidableTotal > 0 
            ? (avoidableTotal / unavoidableTotal).toFixed(1) 
            : '0'} 
        />
        <CategoryDistribution data={categoryData} />
      </div>

      {showGoalModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
        }}>
          <div style={{
            background: '#111311', border: '1px solid #1f2b1f',
            borderRadius: '16px', padding: '32px', width: '400px'
          }}>
            <h3 style={{ color: '#ffffff', marginBottom: '8px' }}>Set Savings Goal</h3>
            <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '24px' }}>
              Your current savings rate is {savingsRate}%. Set a new monthly target.
            </p>
            <input
              type="number"
              placeholder="Enter target savings amount (₹)"
              value={goalTarget}
              onChange={e => setGoalTarget(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', background: '#0a0a0a',
                border: '1px solid #1f2b1f', borderRadius: '8px',
                color: '#ffffff', fontSize: '14px', marginBottom: '16px'
              }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowGoalModal(false)}
                style={{
                  flex: 1, padding: '10px', background: 'transparent',
                  border: '1px solid #1f2b1f', color: '#6b7280',
                  borderRadius: '8px', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert(`Goal set to ₹${goalTarget} per month!`)
                  setShowGoalModal(false)
                }}
                style={{
                  flex: 1, padding: '10px', background: '#00ff88',
                  border: 'none', color: '#0a0a0a', fontWeight: 600,
                  borderRadius: '8px', cursor: 'pointer'
                }}
              >
                Save Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function SavingsRateGauge({ rate, setShowGoalModal }) {
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
          <button
            onClick={() => setShowGoalModal(true)}
            style={{
              width: '100%',
              padding: '10px',
              background: 'transparent',
              border: '1px solid #1f2b1f',
              color: '#ffffff',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px',
              letterSpacing: '1px'
            }}
          >
            RECALIBRATE GOAL
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


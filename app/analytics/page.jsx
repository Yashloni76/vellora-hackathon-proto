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

  const [rawExpenses, setRawExpenses] = useState([])
  const [rawIncome, setRawIncome] = useState([])
  const [totalIncome, setTotalIncome] = useState(0)
  const [savingsRate, setSavingsRate] = useState(0)
  const [avoidableTotal, setAvoidableTotal] = useState(0)
  const [unavoidableTotal, setUnavoidableTotal] = useState(0)
  const [categoryData, setCategoryData] = useState([])
  const [savingsData, setSavingsData] = useState([])
  const [peakMonth, setPeakMonth] = useState('-')
  const [cashDrag, setCashDrag] = useState(0)
  const [loading, setLoading] = useState(true)
  const [velocityView, setVelocityView] = useState('monthly')
  const [filter, setFilter] = useState('all_time')
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [goalTarget, setGoalTarget] = useState('')
  const [savedGoal, setSavedGoal] = useState(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading])

  useEffect(() => {
    if (!user) return
    fetchAnalyticsData()
  }, [user])

  useEffect(() => {
    if (!user) return

    const subscription = supabase
      .channel('expenses-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'expenses',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchAnalyticsData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [user])

  const fetchAnalyticsData = async () => {
    setLoading(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setLoading(false); return }

    const userId = session.user.id

    const [{ data: expData }, { data: incData }] = await Promise.all([
      supabase.from('expenses').select('*').eq('user_id', userId),
      supabase.from('income').select('*').eq('user_id', userId)
    ])

    const expenses = expData || []
    const income = incData || []

    console.log('EXPENSES:', expenses.length, expenses[0])
    console.log('INCOME:', income.length, income[0])

    setRawExpenses(expenses)
    setRawIncome(income)

    const { data: goalData } = await supabase
      .from('income')
      .select('savings_goal')
      .eq('user_id', userId)
      .limit(1)
      .single()

    if (goalData?.savings_goal) setSavedGoal(Number(goalData.savings_goal))

    // TOTAL INCOME — sum all income records for this user
    const totalIncomeCalc = income.reduce((sum, i) => sum + Number(i.amount || 0), 0)
    setTotalIncome(totalIncomeCalc)
    console.log('TOTAL INCOME:', totalIncomeCalc)

    // TOTAL EXPENSES
    const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0)
    console.log('TOTAL SPENT:', totalSpent)

    // SAVINGS
    const saved = Math.max(0, totalIncomeCalc - totalSpent)
    console.log('SAVED:', saved)

    // SAVINGS RATE
    const rate = totalIncomeCalc > 0 ? Math.round((saved / totalIncomeCalc) * 100) : 0
    setSavingsRate(rate)

    // AVOIDABLE vs UNAVOIDABLE
    const avoidable = expenses
      .filter(e => e.type === 'avoidable')
      .reduce((sum, e) => sum + Number(e.amount || 0), 0)
    const unavoidable = expenses
      .filter(e => e.type === 'unavoidable')
      .reduce((sum, e) => sum + Number(e.amount || 0), 0)
    setAvoidableTotal(avoidable)
    setUnavoidableTotal(unavoidable)

    // CATEGORY MAP — guess from title if category is null
    const guessCategory = (exp) => {
      if (exp.category && exp.category.trim() !== '' && exp.category !== 'null') return exp.category.trim()
      const t = (exp.title || '').toLowerCase()
      if (t.includes('bus') || t.includes('auto') || t.includes('petrol') || t.includes('travel') || t.includes('uber') || t.includes('ola') || t.includes('train')) return 'Transport'
      if (t.includes('food') || t.includes('canteen') || t.includes('zomato') || t.includes('swiggy') || t.includes('misal') || t.includes('restaurant') || t.includes('cafe')) return 'Food'
      if (t.includes('netflix') || t.includes('amazon') || t.includes('prime') || t.includes('hotstar') || t.includes('movie') || t.includes('spotify')) return 'Entertainment'
      if (t.includes('rent') || t.includes('pg') || t.includes('hostel')) return 'Rent'
      if (t.includes('electric') || t.includes('water') || t.includes('wifi') || t.includes('bill') || t.includes('recharge')) return 'Utilities'
      if (t.includes('medicine') || t.includes('doctor') || t.includes('hospital')) return 'Health'
      return exp.type === 'avoidable' ? 'Lifestyle' : 'Essential'
    }
    const categoryMap = {}
    expenses.forEach(exp => {
      const cat = guessCategory(exp)
      categoryMap[cat] = (categoryMap[cat] || 0) + Number(exp.amount || 0)
    })
    setCategoryData(Object.entries(categoryMap).map(([name, value]) => ({ name, value })))

    // MONTHLY SAVINGS CHART — group expenses by month, subtract from monthly income share
    const monthlySpent = {}
    expenses.forEach(exp => {
      if (!exp.date) return
      const m = new Date(exp.date + 'T00:00:00').toLocaleString('en-US', { month: 'short' }).toUpperCase()
      monthlySpent[m] = (monthlySpent[m] || 0) + Number(exp.amount || 0)
    })

    // Distribute income evenly across all months that have expense data
    const activeMonths = Object.keys(monthlySpent)
    const incomePerMonth = activeMonths.length > 0 ? totalIncomeCalc / activeMonths.length : 0

    // Build last 6 months ordered
    const last6 = Array.from({ length: 6 }, (_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - (5 - i))
      return d.toLocaleString('en-US', { month: 'short' }).toUpperCase()
    })

    let cumulative = 0
    const savingsChart = last6.map(m => {
      const spent = monthlySpent[m] || 0
      const inc = monthlySpent[m] !== undefined ? incomePerMonth : 0
      cumulative += Math.max(0, inc - spent)
      return { month: m, amount: Math.round(cumulative) }
    })
    setSavingsData(savingsChart)

    // PEAK LIQUIDITY
    const peakEntry = savingsChart.reduce((best, s) => s.amount > (best?.amount || 0) ? s : best, null)
    setPeakMonth(peakEntry?.month || '-')

    // CASH DRAG
    const drag = totalIncomeCalc > 0 ? Math.round((avoidable / totalIncomeCalc) * 100) : 0
    setCashDrag(drag)

    setLoading(false)
  }

  const handleSaveGoal = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    await supabase
      .from('income')
      .update({ savings_goal: Number(goalTarget) })
      .eq('user_id', session.user.id)
    setSavedGoal(Number(goalTarget))
    setShowGoalModal(false)
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

  if (!loading && rawExpenses.length === 0) return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      height: '60vh', gap: '12px'
    }}>
      <p style={{ color: '#ffffff', fontSize: '18px', fontWeight: 500 }}>
        No expense data yet
      </p>
      <p style={{ color: '#6b7280', fontSize: '14px' }}>
        Add expenses from the dashboard to see your analytics
      </p>
      <a href="/dashboard" style={{
        marginTop: '8px', padding: '10px 24px',
        background: '#00ff88', color: '#0a0a0a',
        borderRadius: '8px', fontWeight: 600,
        fontSize: '13px', textDecoration: 'none'
      }}>
        Go to Dashboard
      </a>
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

      {/* Filter Dropdown */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{
            padding: '8px 16px',
            background: '#111311',
            border: '1px solid #1f2b1f',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          <option value="this_month">This Month</option>
          <option value="last_3">Last 3 Months</option>
          <option value="last_6">Last 6 Months</option>
          <option value="all_time">All Time</option>
        </select>
      </div>

      {/* Top Row: Line + Gauge */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', width: '100%', boxSizing: 'border-box' }}>
        <SavingsLineChart 
          savingsData={savingsData} 
          velocityView={velocityView} 
          setVelocityView={setVelocityView} 
        />
        <SavingsRateGauge 
          savingsRate={savingsRate} 
          savedGoal={savedGoal}
          setShowGoalModal={setShowGoalModal}
        />
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', width: '100%', boxSizing: 'border-box' }}>
        <div className="card bg-[#111311] border border-border-dark p-6 rounded-xl relative overflow-hidden">
           <p className="text-muted text-[10px] uppercase tracking-widest mb-1">Peak Liquidity</p>
           <p style={{ color: '#00ff88', fontSize: '22px', fontWeight: 600 }}>{peakMonth}</p>
        </div>
        <div className="card bg-[#111311] border border-border-dark p-6 rounded-xl relative overflow-hidden">
           <p className="text-muted text-[10px] uppercase tracking-widest mb-1">Savings Rate</p>
           <p style={{ color: '#00ff88', fontSize: '22px', fontWeight: 600 }}>{savingsRate}%</p>
        </div>
        <div className="card bg-[#111311] border border-border-dark p-6 rounded-xl relative overflow-hidden">
           <p className="text-muted text-[10px] uppercase tracking-widest mb-1">Cash Drag</p>
           <p style={{ color: '#f59e0b', fontSize: '22px', fontWeight: 600 }}>{cashDrag}%</p>
        </div>
      </div>

      {/* Middle Row: Donut + Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', width: '100%', boxSizing: 'border-box' }}>
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
                onClick={handleSaveGoal}
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

function SavingsRateGauge({ savingsRate, savedGoal, setShowGoalModal }) {
  const data = [
    { name: "Rate", value: savingsRate, fill: "#00ff88" }
  ];

  return (
    <div className="card bg-[#111311] border border-border-dark p-8 relative overflow-hidden flex flex-col h-full group">
       <div className="space-y-1 mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight">Savings Rate</h2>
          <p className="text-muted text-[11px] font-medium uppercase tracking-widest">Efficiency index</p>
       </div>

       <div className="flex-1 relative flex items-center justify-center">
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={200}>
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
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-5xl font-bold text-white tracking-tighter shadow-sm">{savingsRate}%</span>
            <span className="text-[10px] text-muted font-bold tracking-widest uppercase mt-2">Active Ratio</span>
          </div>
       </div>

       <div className="mt-6 pt-6 border-t border-border-dark/50">
          <p style={{ color: '#6b7280', fontSize: '13px', textAlign: 'center', marginBottom: '16px' }}>
            {savedGoal
              ? `Goal: ₹${savedGoal.toLocaleString()} — you are saving ${savingsRate}% of income`
              : `Your savings efficiency is currently at ${savingsRate}%`
            }
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

const CATEGORY_COLORS = {
  'Food': '#00ff88',
  'Transport': '#00b4d8',
  'Entertainment': '#f59e0b',
  'Utilities': '#a855f7',
  'Health': '#ff4444',
  'Shopping': '#f97316',
  'Education': '#06b6d4',
  'Rent': '#6366f1',
  'Lifestyle': '#ec4899',
  'Essential': '#6b7280',
  'Other': '#84cc16'
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

       <div className="flex-1 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height={200}>
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
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Spent']}
                />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CATEGORY_COLORS[entry.name] || '#00ff88'}
                    />
                  ))}
                </Bar>
             </BarChart>
          </ResponsiveContainer>
       </div>
    </div>
  );
}

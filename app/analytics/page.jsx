'use client'
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Cell,
  Tooltip 
} from "recharts";

import SavingsLineChart from "@/components/analytics/SavingsLineChart";
import ExpenseDonut from "@/components/analytics/ExpenseDonut";

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

const FALLBACK_COLORS = ['#00ff88', '#00b4d8', '#f59e0b', '#a855f7', '#ff4444', '#f97316', '#06b6d4', '#6366f1', '#ec4899', '#84cc16']

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalIncome, setTotalIncome] = useState(0)
  const [savingsRate, setSavingsRate] = useState(0)
  const [cashDrag, setCashDrag] = useState(0)
  const [lostPotential, setLostPotential] = useState(0)
  const [peakMonth, setPeakMonth] = useState('-')
  
  const [avoidableTotal, setAvoidableTotal] = useState(0)
  const [unavoidableTotal, setUnavoidableTotal] = useState(0)
  const [categoryData, setCategoryData] = useState([])
  const [savingsData, setSavingsData] = useState([])
  
  const [rawExpenses, setRawExpenses] = useState([])
  const [rawIncome, setRawIncome] = useState([])
  const [filter, setFilter] = useState('all_time')

  useEffect(() => {
    const init = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('SESSION:', session?.user?.id, sessionError)
      
      if (sessionError) {
        setError(sessionError.message)
        setLoading(false)
        return
      }

      if (!session) {
        console.log('No session found')
        setLoading(false)
        return
      }
      
      await fetchAnalyticsData(session.user.id)
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, session?.user?.id)
      if (session?.user?.id) {
        setError(null)
        await fetchAnalyticsData(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Real-time listener for database updates
    const channel = supabase
      .channel('analytics-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) fetchAnalyticsData(session.user.id)
        })
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [])

  const processData = (expenses, income, filterValue) => {
    const now = new Date()
    const filtered = expenses.filter(exp => {
      if (!exp.date) return true
      const d = new Date(exp.date + 'T00:00:00')
      if (filterValue === 'this_month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      }
      if (filterValue === 'last_3') {
        const cutoff = new Date(now); cutoff.setMonth(now.getMonth() - 3)
        return d >= cutoff
      }
      if (filterValue === 'last_6') {
        const cutoff = new Date(now); cutoff.setMonth(now.getMonth() - 6)
        return d >= cutoff
      }
      return true // all_time
    })

    const totalInc = income.reduce((sum, i) => sum + Number(i.amount || 0), 0)
    setTotalIncome(totalInc)

    const totalSpent = filtered.reduce((sum, e) => sum + Number(e.amount || 0), 0)
    const rate = totalInc > 0 ? Math.round(((totalInc - totalSpent) / totalInc) * 100) : 0
    setSavingsRate(rate)

    const avoidable = filtered.filter(e => e.type === 'avoidable').reduce((sum, e) => sum + Number(e.amount || 0), 0)
    const unavoidable = filtered.filter(e => e.type === 'unavoidable').reduce((sum, e) => sum + Number(e.amount || 0), 0)
    setAvoidableTotal(avoidable)
    setUnavoidableTotal(unavoidable)

    const lost = Math.round(avoidable * 0.12 / 12)
    setLostPotential(lost)

    const drag = totalInc > 0 ? Math.round((avoidable / totalInc) * 100) : 0
    setCashDrag(drag)

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
    filtered.forEach(exp => {
      const cat = guessCategory(exp)
      categoryMap[cat] = (categoryMap[cat] || 0) + Number(exp.amount || 0)
    })
    setCategoryData(Object.entries(categoryMap).map(([name, value]) => ({ name, value })))

    const monthlyIncomeMap = {}
    income.forEach(inc => {
      const m = inc.month
        ? inc.month.trim().toUpperCase().slice(0, 3)
        : inc.created_at
          ? new Date(inc.created_at).toLocaleString('en-US', { month: 'short' }).toUpperCase()
          : null
      if (m) monthlyIncomeMap[m] = (monthlyIncomeMap[m] || 0) + Number(inc.amount || 0)
    })

    const monthlySpent = {}
    filtered.forEach(exp => {
      if (!exp.date) return
      const m = new Date(exp.date + 'T00:00:00').toLocaleString('en-US', { month: 'short' }).toUpperCase()
      monthlySpent[m] = (monthlySpent[m] || 0) + Number(exp.amount || 0)
    })

    const activeMonthSet = new Set()
    filtered.forEach(exp => {
      if (!exp.date) return
      const m = new Date(exp.date + 'T00:00:00').toLocaleString('en-US', { month: 'short' }).toUpperCase()
      activeMonthSet.add(m)
    })
    Object.keys(monthlyIncomeMap).forEach(m => activeMonthSet.add(m))

    const MONTH_ORDER = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
    const displayMonths = MONTH_ORDER.filter(m => activeMonthSet.has(m))
    const monthsToShow = displayMonths.length > 0 ? displayMonths : ['APR']

    let cumulative = 0
    const combinedChart = monthsToShow.map(m => {
      const spent = monthlySpent[m] || 0
      const inc = monthlyIncomeMap[m] || (totalInc / monthsToShow.length)
      cumulative += Math.max(0, inc - spent)
      return {
        month: m,
        amount: Math.round(cumulative),
        spent: monthlySpent[m] ? Math.round(monthlySpent[m]) : null
      }
    })
    setSavingsData(combinedChart)

    const peak = combinedChart.reduce((best, s) => s.amount > (best?.amount || 0) ? s : best, null)
    setPeakMonth(peak?.month || '-')
  }

  const fetchAnalyticsData = async (userId) => {
    setLoading(true)
    setError(null)
    console.log('Fetching for user:', userId)

    const [{ data: expData, error: expError }, { data: incData, error: incError }] = await Promise.all([
      supabase.from('expenses').select('*').eq('user_id', userId),
      supabase.from('income').select('*').eq('user_id', userId)
    ])

    if (expError) { console.error('Expense fetch error:', expError); setError(expError.message) }
    if (incError) { console.error('Income fetch error:', incError); setError(incError.message) }

    console.log('Expenses fetched:', expData?.length, expError)
    console.log('Income fetched:', incData?.length, incError)

    const expenses = expData || []
    const income = incData || []

    setRawExpenses(expenses)
    setRawIncome(income)

    processData(expenses, income, filter)
    setLoading(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
      <div className="text-[#00ff88] text-xl">Loading Analytics...</div>
    </div>
  )

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
      <div className="flex justify-end mb-4">
        <select
          value={filter}
          onChange={e => {
            const newFilter = e.target.value
            setFilter(newFilter)
            processData(rawExpenses, rawIncome, newFilter)
          }}
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

      {error && (
        <div style={{ color: '#ff4444', fontSize: '13px', padding: '12px', background: '#1a0000', border: '1px solid #ff444430', borderRadius: '8px', marginBottom: '16px' }}>
          Error loading data: {error}
        </div>
      )}

       {/* Top Summary Row */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-[#111311] border border-border-dark p-6 rounded-xl relative overflow-hidden">
            <p className="text-muted text-[10px] uppercase tracking-widest mb-1">Total Income</p>
            <p className="text-white text-2xl font-bold">₹{totalIncome.toLocaleString()}</p>
        </div>
        <div className="card bg-[#111311] border border-border-dark p-6 rounded-xl relative overflow-hidden">
            <p className="text-muted text-[10px] uppercase tracking-widest mb-1">Savings Rate</p>
            <p className="text-[#00ff88] text-2xl font-bold">{savingsRate}%</p>
        </div>
        <div style={{
          background: '#111311',
          border: '1px solid #1f2b1f',
          borderRadius: '12px',
          padding: '20px 24px'
        }}>
          <p style={{ color: '#6b7280', fontSize: '11px', letterSpacing: '1px', marginBottom: '8px' }}>
            LOST POTENTIAL
          </p>
          <p style={{ color: '#f59e0b', fontSize: '22px', fontWeight: 600, margin: 0 }}>
            {cashDrag}%
          </p>
          <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '6px', margin: 0 }}>
            Costing you{' '}
            <span style={{ color: '#ff4444', fontWeight: 600 }}>
              ₹{lostPotential.toLocaleString()}
            </span>
            {' '}in lost returns this month
          </p>
          <p style={{ color: '#6b7280', fontSize: '10px', marginTop: '4px' }}>
            Based on Nifty 50 avg. 12% annual return
          </p>
        </div>
      </div>

      {/* Top Row: Line */}
      <div className="grid grid-cols-1 gap-8">
        <SavingsLineChart savingsData={savingsData} />
      </div>

      {/* Middle Row: Donut + Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ExpenseDonut avoidableTotal={avoidableTotal} unavoidableTotal={unavoidableTotal} />
        <CategoryDistribution data={categoryData} />
      </div>
    </motion.div>
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
                      fill={CATEGORY_COLORS[entry.name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
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

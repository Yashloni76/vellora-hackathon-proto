'use client'
import { useState, useEffect } from "react";
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { motion } from "framer-motion";

import { 
  ComposedChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { TrendingDown } from "lucide-react";

// Vibrant 10-color fallback palette
const CATEGORY_COLORS = [
  "#00ff88", "#00cc6a", "#00994f", "#006634", 
  "#1a1f1a", "#2b3a2b", "#3c553c", "#4d704d", 
  "#5e8b5e", "#6fa66f"
];

// Keyword Classification Regex Map
const CATEGORY_MAP = {
  food: /zomato|swiggy|blinkit|zepto|kfc|mcdonalds|burger|pizza|dinner|lunch/i,
  transport: /uber|ola|rapido|metro|petrol|fuel|train|flight/i,
  shopping: /amazon|flipkart|myntra|meesho|ajio|zara|h&m|mall/i,
  entertainment: /netflix|prime|spotify|movie|pvr|bookmyshow/i,
  utilities: /electricity|water|wifi|broadband|recharge|jio|airtel/i,
  health: /pharmacy|hospital|apollo|1mg|doctor|clinic/i,
  education: /udemy|coursera|tuition|fee|book|college/i,
}

// Function to intelligently guess category
function guessCategory(title) {
  if (!title) return 'other'
  for (const [cat, regex] of Object.entries(CATEGORY_MAP)) {
    if (regex.test(title)) return cat
  }
  return 'other'
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Raw Data
  const [rawExpenses, setRawExpenses] = useState([])
  const [rawIncome, setRawIncome] = useState(0)
  
  // Reactive Filter
  const [timeFilter, setTimeFilter] = useState('All') // 1M, 3M, 6M, All
  
  // Monolithic Engine State
  const [metrics, setMetrics] = useState({
    wealthArcData: [],
    categoryDist: [],
    donutData: [],
    donutRatio: "0.0",
    avoidableTotal: 0,
    unavoidableTotal: 0,
    savingsTotal: 0,
    lostPotential: 0
  })

  // 1. Production-Hardened Auth
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
      } else {
        router.push('/login')
      }
    }
    
    fetchSession()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
      } else {
        router.push('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  // 2. Resilient Data Fetching
  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      setLoading(true)
      
      try {
        const { data: expData, error: expError } = await supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: true })

        if (expError) throw expError
        
        let incomeVal = 0
        try {
          const { data: incData, error: incError } = await supabase
            .from('users')
            .select('income')
            .eq('id', user.id)
            .single()
            
          if (!incError && incData) {
            incomeVal = Number(incData.income) || 0
          }
        } catch (incErr) {
          console.warn("Silent Resilience: Income fetch failed, falling back to 0.", incErr)
        }

        setRawExpenses(expData || [])
        setRawIncome(incomeVal)
      } catch (err) {
        console.error("Critical fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  // 3. Monolithic Data Engine (Reactive Processor)
  useEffect(() => {
    if (rawExpenses.length === 0 && rawIncome === 0) {
      setLoading(false);
      return;
    }

    const processData = () => {
      let filteredExp = [...rawExpenses]
      const now = new Date()

      if (timeFilter !== 'All') {
        const monthsAgo = parseInt(timeFilter)
        // Set cutoff to the 1st of the month 'monthsAgo' back
        const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1)
        filteredExp = filteredExp.filter(e => new Date(e.date) >= cutoffDate)
      }

      // Dynamic X-Axis Discovery
      const monthlyGroups = {}
      let totalSpent = 0
      let avoidable = 0
      let unavoidable = 0
      
      const catMap = {}

      filteredExp.forEach(e => {
        const amt = Number(e.amount)
        totalSpent += amt
        
        if (e.type === 'avoidable') avoidable += amt
        else unavoidable += amt
        
        // Month key formatted chronologically (YYYY-MM)
        const d = new Date(e.date)
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        const monthLabel = d.toLocaleString('default', { month: 'short' })
        
        if (!monthlyGroups[monthKey]) {
          monthlyGroups[monthKey] = { label: monthLabel, sortKey: monthKey, expense: 0 }
        }
        monthlyGroups[monthKey].expense += amt

        // Intelligent Keyword Classification
        let cat = e.category
        if (!cat || cat.trim() === '') cat = guessCategory(e.title)
        cat = cat.toLowerCase()
        if (!catMap[cat]) catMap[cat] = 0
        catMap[cat] += amt
      })

      // Sort Active Months chronologically
      const sortedMonths = Object.values(monthlyGroups).sort((a, b) => a.sortKey.localeCompare(b.sortKey))

      // The Wealth Accumulation Arc: Cumulative Savings 
      let cumulativeSavings = 0
      const arcData = sortedMonths.map(m => {
        cumulativeSavings += (rawIncome - m.expense)
        return {
           month: m.label,
           expense: m.expense,
           savings: cumulativeSavings > 0 ? cumulativeSavings : 0
        }
      })

      const catData = Object.entries(catMap)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name: name.toUpperCase(), value }))

      // Lost Potential Metric: Opportunity cost of "Avoidable" spending
      // Nifty 50 historical average (12% annual). Future value across 5 yrs.
      const futureValue = Math.round(avoidable * Math.pow(1.12, 5))
      const lostPotential = futureValue - avoidable

      setMetrics({
        wealthArcData: arcData,
        categoryDist: catData,
        donutData: [
          { name: "AVOIDABLE", value: avoidable, color: "#00ff88" },
          { name: "ESSENTIAL", value: unavoidable, color: "#6b7280" }
        ],
        donutRatio: avoidable > 0 ? (unavoidable / avoidable).toFixed(1) : "0.0",
        avoidableTotal: avoidable,
        unavoidableTotal: unavoidable,
        savingsTotal: (rawIncome * (timeFilter === 'All' ? Math.max(1, sortedMonths.length) : parseInt(timeFilter))) - totalSpent,
        lostPotential: lostPotential
      })
    }

    processData()
  }, [rawExpenses, rawIncome, timeFilter])


  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
      <div className="text-[#00ff88] text-xl font-black tracking-widest uppercase animate-pulse">Initializing Engine...</div>
    </div>
  )

  if (!user) return null

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }}
      className="p-6 md:p-12 space-y-10 pb-24 min-h-screen"
    >
      {/* Platform Header & Filters */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-white">Visual Analytics</h1>
            <div className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_12px_rgba(0,255,136,0.8)]" />
          </div>
          <p className="text-[#6b7280] text-xs font-bold uppercase tracking-widest">
            Detailed performance breakdown of your financial blueprint.
          </p>
        </div>

        <div className="bg-[#111311] border border-[#1f2b1f] rounded-xl flex items-center p-1 gap-1">
          {['1M', '3M', '6M', 'All'].map(f => (
            <button 
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`px-4 py-2 text-[10px] font-black tracking-widest uppercase rounded-lg transition-all ${timeFilter === f ? 'bg-[#00ff88] text-black' : 'text-[#6b7280] hover:text-white hover:bg-[#1a1f1a]'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      {/* Row 1: The Wealth Accumulation Arc & Lost Potential */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        
        <div className="bg-[#111311] border border-[#1f2b1f] p-8 rounded-2xl relative overflow-hidden flex flex-col h-[400px]">
          <div className="space-y-1 mb-6">
            <h2 className="text-xl font-bold text-white tracking-tight">Wealth Accumulation Arc</h2>
            <p className="text-[#6b7280] text-[10px] font-bold uppercase tracking-widest">
              Cumulative Savings (Green) vs Monthly Expense Track (Red)
            </p>
          </div>
          
          <div className="flex-1 w-full relative z-10">
            {metrics.wealthArcData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={metrics.wealthArcData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "#6b7280", fontSize: 10, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis 
                    yAxisId="left"
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "#00ff88", fontSize: 10, fontWeight: 600 }}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "#ff4444", fontSize: 10, fontWeight: 600 }}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#111311", border: "1px solid #1f2b1f", borderRadius: "8px", fontSize: "12px", color: "#fff" }}
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="expense" 
                    stroke="#ff4444" 
                    strokeWidth={2} 
                    strokeDasharray="5 5"
                    dot={{ r: 3, fill: "#ff4444" }}
                    activeDot={{ r: 5 }}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="savings" 
                    stroke="#00ff88" 
                    strokeWidth={4} 
                    connectNulls={false} 
                    dot={{ r: 4, fill: "#00ff88", strokeWidth: 2, stroke: "#111" }}
                    activeDot={{ r: 6, fill: "#fff", stroke: "#00ff88", strokeWidth: 3 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
               <div className="flex items-center justify-center h-full text-[#6b7280] text-sm font-bold uppercase tracking-widest">No data for this period</div>
            )}
          </div>
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ff88]/5 rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="bg-[#111311] border border-[#1f2b1f] p-8 rounded-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <TrendingDown size={20} className="text-[#ff4444]" />
              Lost Potential
            </h2>
            <p className="text-[#6b7280] text-[10px] font-bold uppercase tracking-widest leading-relaxed">
              Opportunity cost of your avoidable spending over 5 years (Nifty 50 @ 12% CAGR)
            </p>
          </div>

          <div className="py-8 text-center space-y-4">
             <div className="text-5xl font-black text-[#ff4444] tracking-tighter drop-shadow-sm">
               ₹{metrics.lostPotential.toLocaleString('en-IN')}
             </div>
             <div className="text-xs text-[#a0a0a0] font-medium max-w-[200px] mx-auto border-t border-[#1f2b1f] pt-4">
               You spent ₹{metrics.avoidableTotal.toLocaleString('en-IN')} on non-essentials. Invested, it would have generated this much pure profit.
             </div>
          </div>
          
          <button onClick={() => router.push('/ai-advisor')} className="w-full bg-[#1a1f1a] border border-[#1f2b1f] text-white text-[10px] font-black tracking-widest uppercase py-3 rounded-xl hover:border-[#ff4444] hover:bg-[#ff4444]/10 transition-colors cursor-pointer">
            View AI Strategy to Fix
          </button>
        </div>

      </div>

      {/* Row 2: Expense Anatomy & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="bg-[#111311] border border-[#1f2b1f] p-8 rounded-2xl relative overflow-hidden flex flex-col h-[350px]">
          <h2 className="text-xl font-bold text-white tracking-tight mb-2">Expense Anatomy</h2>
          <p className="text-[#6b7280] text-[10px] font-bold uppercase tracking-widest mb-4">Essential vs Avoidable Efficiency</p>
          
          <div className="flex-1 flex items-center justify-between gap-4">
            <div className="relative w-48 h-48 flex-shrink-0">
              {metrics.donutData.reduce((acc, curr) => acc + curr.value, 0) > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      startAngle={90}
                      endAngle={450}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {metrics.donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center w-full h-full text-[#6b7280] text-[10px] font-bold tracking-widest uppercase">No Data</div>
              )}
              
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-[#6b7280] font-bold tracking-[0.2em] uppercase mb-1">Ratio</span>
                <span className="text-2xl font-black text-white tracking-tight">{metrics.donutRatio}:1</span>
              </div>
            </div>

            <div className="space-y-6 max-w-[160px] w-full bg-[#0a0a0a] p-4 rounded-xl border border-[#1f2b1f]">
              {metrics.donutData.map((entry) => (
                <div key={entry.name} className="space-y-1.5 group">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-[10px] text-[#6b7280] font-bold tracking-widest uppercase transition-colors group-hover:text-white">
                      {entry.name}
                    </span>
                  </div>
                  <p className="text-lg font-black text-white tracking-tight">
                    ₹{entry.value.toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#111311] border border-[#1f2b1f] p-8 rounded-2xl relative overflow-hidden flex flex-col h-[350px]">
           <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                 <h2 className="text-xl font-bold text-white tracking-tight">Category Distribution</h2>
                 <p className="text-[#6b7280] text-[10px] font-bold uppercase tracking-widest">Powered by GuessCategory Regex Engine</p>
              </div>
           </div>

           <div className="flex-1 w-full relative z-10">
              {metrics.categoryDist.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={metrics.categoryDist} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: "#6b7280", fontSize: 9, fontWeight: 800 }}
                        interval={0}
                        angle={-25}
                        textAnchor="end"
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: "#6b7280", fontSize: 10, fontWeight: 600 }}
                      />
                      <Tooltip 
                        cursor={{ fill: "rgba(255,255,255,0.02)" }}
                        contentStyle={{ backgroundColor: "#111311", border: "1px solid #1f2b1f", borderRadius: "8px", fontSize: "11px", color: "#fff" }}
                        itemStyle={{ color: "#00ff88" }}
                      />
                      <Bar 
                        dataKey="value" 
                        radius={[4, 4, 0, 0]}
                        barSize={30}
                      >
                        {metrics.categoryDist.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} 
                            className="hover:opacity-80 transition-opacity cursor-pointer"
                          />
                        ))}
                      </Bar>
                   </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-[#6b7280] text-sm font-bold uppercase tracking-widest">No data</div>
              )}
           </div>
        </div>

      </div>
    </motion.div>
  );
}

'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from "framer-motion";
import { Sparkles, Brain, Loader2 } from "lucide-react";
import SuggestionCard from "@/components/ai-advisor/SuggestionCard";

function SkeletonCard() {
  return (
    <div className="bg-[#111311] border border-[#1a1f1a] rounded-2xl p-5 flex gap-4 items-start animate-pulse" style={{ borderLeft: "3px solid #1a1f1a" }}>
      <div className="w-10 h-10 rounded-xl bg-[#1a1f1a] flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-3 bg-[#1a1f1a] rounded-full w-24" />
        <div className="h-4 bg-[#222] rounded-full w-3/4" />
        <div className="h-3 bg-[#1a1f1a] rounded-full w-full" />
      </div>
    </div>
  );
}

export default function AIAdvisorPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [userIncome, setUserIncome] = useState(0)
  const [expenses, setExpenses] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [analyzing, setAnalyzing] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [totalSpent, setTotalSpent] = useState(0)
  const [avoidableTotal, setAvoidableTotal] = useState(0)
  const [unavoidableTotal, setUnavoidableTotal] = useState(0)
  const [savings, setSavings] = useState(0)

  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  const fetchUserData = async () => {
    if (!user) return
    setDataLoading(true)

    const { data: userData } = await supabase
      .from('users')
      .select('income, goal')
      .eq('id', user.id)
      .single()

    const income = Number(userData?.income) || 0
    setUserIncome(income)

    const { data: expenseData } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    const exp = expenseData || []
    setExpenses(exp)

    const total = exp.reduce((sum, e) => sum + Number(e.amount), 0)
    const avoidable = exp
      .filter(e => e.type === 'avoidable')
      .reduce((sum, e) => sum + Number(e.amount), 0)
    const unavoidable = exp
      .filter(e => e.type === 'unavoidable')
      .reduce((sum, e) => sum + Number(e.amount), 0)

    setTotalSpent(total)
    setAvoidableTotal(avoidable)
    setUnavoidableTotal(unavoidable)
    setSavings(income - total)
    setDataLoading(false)
  }

  useEffect(() => {
    if (user) fetchUserData()
  }, [user])

  const getAIAnalysis = async () => {
    setAnalyzing(true)
    setSuggestions([])

    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          income: userIncome,
          unavoidable: unavoidableTotal,
          avoidable: avoidableTotal,
          savings: savings,
          expenses: expenses.map(e => ({
            title: e.title,
            amount: e.amount,
            type: e.type,
            category: e.category
          }))
        })
      })
      const data = await res.json()
      if (data.suggestions) {
        setSuggestions(data.suggestions)
      }
    } catch (err) {
      console.error('AI error:', err)
      setSuggestions([{
        type: 'investment',
        title: 'AI Unavailable',
        desc: 'Could not connect to AI. Please try again.'
      }])
    }
    setAnalyzing(false)
  }

  if (loading || dataLoading) return (
    <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
      <div className="text-[#00ff88] text-xl">Loading profile...</div>
    </div>
  )

  const investmentCards = suggestions.filter((s) => s.type === "investment");
  const savingCards = suggestions.filter((s) => s.type === "saving");

  const STATS = [
    { label: "INCOME", value: `₹${userIncome.toLocaleString()}`, color: "text-white" },
    { label: "TOTAL SPENT", value: `₹${totalSpent.toLocaleString()}`, color: "text-white" },
    { label: "AVOIDABLE", value: `₹${avoidableTotal.toLocaleString()}`, color: "text-yellow-400" },
    { label: "SAVINGS", value: `₹${savings.toLocaleString()}`, color: "text-[#00ff88]" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }}
      className="p-10 space-y-12 pb-24 min-h-screen"
    >
      {/* Header */}
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-black tracking-tight text-white">AI Advisor</h1>
          <span className="w-2.5 h-2.5 rounded-full bg-[#00ff88] shadow-[0_0_12px_rgba(0,255,136,0.7)] animate-pulse" />
        </div>
        <p className="text-[#666] text-sm font-medium flex items-center gap-2">
          <Brain size={14} className="text-[#00ff88]" />
          Powered by Google Gemini — personalized intelligence for your financial profile
        </p>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-[#111311] border border-[#1a1f1a] rounded-2xl p-5 space-y-1">
            <p className="text-[10px] text-[#555] font-bold tracking-[0.18em] uppercase">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Get AI Analysis Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Personalized Suggestions</h2>
            <p className="text-[#555] text-xs mt-0.5">Smart analysis of your financial profile.</p>
          </div>
          <button
            onClick={getAIAnalysis}
            disabled={analyzing}
            className="flex items-center gap-2 bg-[#00ff88] hover:bg-[#00e87a] text-black font-black text-sm px-5 py-2.5 rounded-xl transition-all shadow-[0_0_20px_rgba(0,255,136,0.25)] hover:shadow-[0_0_30px_rgba(0,255,136,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {analyzing ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Sparkles size={15} />
            )}
            {analyzing ? "Analyzing..." : "Get AI Analysis"}
          </button>
        </div>

        {/* Loading Skeletons */}
        {analyzing && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Results */}
        {suggestions.length > 0 && !analyzing && (
          <div className="space-y-6">
            {/* Investment Suggestions */}
            {investmentCards.length > 0 && (
              <div className="space-y-3">
                <p className="text-[11px] font-black tracking-[0.2em] text-[#00ff88] uppercase">Investment Suggestions</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {investmentCards.map((s, i) => (
                    <SuggestionCard key={i} text={`${s.title}: ${s.desc}`} type="investment" index={i} />
                  ))}
                </div>
              </div>
            )}
            {/* Saving Tips */}
            {savingCards.length > 0 && (
              <div className="space-y-3">
                <p className="text-[11px] font-black tracking-[0.2em] text-emerald-400 uppercase">Ways to Cut Expenses</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savingCards.map((s, i) => (
                    <SuggestionCard key={i} text={`${s.title}: ${s.desc}`} type="saving" index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {suggestions.length === 0 && !analyzing && (
          <div className="flex flex-col items-center justify-center p-12 border border-dashed border-[#1a1f1a] rounded-3xl space-y-4">
             <div className="w-12 h-12 rounded-full bg-[#111] flex items-center justify-center">
                <Brain size={24} className="text-[#333]" />
             </div>
             <p className="text-[#444] text-sm font-medium">Click the button above to generate AI suggestions based on your spending.</p>
          </div>
        )}
      </section>
    </motion.div>
  );
}

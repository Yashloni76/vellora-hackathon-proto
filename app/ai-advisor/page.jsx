'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from "framer-motion";
import { Sparkles, Brain, Loader2, Send, User, MessageCircle } from "lucide-react";
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
  const [userGoal, setUserGoal] = useState(0)
  const [analysisData, setAnalysisData] = useState({
    patternAnalysis: "",
    biggestMistake: "",
    moodWarning: ""
  })
  
  // Chat State
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your Financial Architect. Ask me anything about savings, budget optimization, or financial terms, and I'll help you with research-backed info!" }
  ])
  const [chatInput, setChatInput] = useState("")
  const [chatLoading, setChatLoading] = useState(false)

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
    const goal = Number(userData?.goal) || 0
    setUserIncome(income)
    setUserGoal(goal)

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
          goal: userGoal,
            expenses: expenses.map(e => ({
              title: e.title,
              amount: e.amount,
              type: e.type,
              category: e.category,
              mood: e.mood,
              date: e.date
            }))
          })
        })
        const data = await res.json()
        if (data.suggestions) {
          setSuggestions(data.suggestions)
          setAnalysisData({
            patternAnalysis: data.patternAnalysis || "",
            biggestMistake: data.biggestMistake || "",
            moodWarning: data.moodWarning || ""
          })
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

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!chatInput.trim() || chatLoading) return

    const userMsg = { role: 'user', content: chatInput }
    setMessages(prev => [...prev, userMsg])
    setChatInput("")
    setChatLoading(true)

    try {
      const res = await fetch('/api/advisor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          userContext: {
            income: userIncome,
            savings: savings,
            avoidable: avoidableTotal,
            goal: userGoal
          }
        })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    } catch (err) {
      console.error('Chat error:', err)
      setMessages(prev => [...prev, { role: 'assistant', content: "I encountered an error. Please try asking again." }])
    } finally {
      setChatLoading(false)
    }
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
          Powered by Groq LLaMA-3 — deep transaction intelligence for your financial profile
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
          <div className="space-y-8">
            {/* Analysis Header Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#111311] border border-red-500/20 rounded-2xl p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-2xl -mr-12 -mt-12" />
                <p className="text-[10px] font-black tracking-widest text-red-400 mb-2 uppercase">🚨 BIGGEST MISTAKE</p>
                <p className="text-white text-sm font-medium leading-relaxed">{analysisData.biggestMistake}</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[#111311] border border-orange-500/20 rounded-2xl p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 blur-2xl -mr-12 -mt-12" />
                <p className="text-[10px] font-black tracking-widest text-orange-400 mb-2 uppercase">🎭 MOOD TRIGGER</p>
                <p className="text-white text-sm font-medium leading-relaxed">{analysisData.moodWarning}</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[#111311] border border-[#00ff88]/20 rounded-2xl p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#00ff88]/5 blur-2xl -mr-12 -mt-12" />
                <p className="text-[10px] font-black tracking-widest text-[#00ff88] mb-2 uppercase">📉 PATTERN ANALYSIS</p>
                <p className="text-white text-sm font-medium leading-relaxed">{analysisData.patternAnalysis}</p>
              </motion.div>
            </div>

            {/* Investment Suggestions */}
            {investmentCards.length > 0 && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#1a1f1a] to-transparent" />
                  <p className="text-[11px] font-black tracking-[0.2em] text-[#00ff88] uppercase">Growth Strategies</p>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#1a1f1a] to-transparent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {investmentCards.map((s, i) => (
                    <SuggestionCard 
                      key={i} 
                      title={s.title}
                      desc={s.desc}
                      comparison={s.comparison}
                      links={s.links}
                      type="investment" 
                      index={i} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Saving Tips */}
            {savingCards.length > 0 && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#1a1f1a] to-transparent" />
                  <p className="text-[11px] font-black tracking-[0.2em] text-emerald-400 uppercase">Leaky Bucket Fixes</p>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#1a1f1a] to-transparent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {savingCards.map((s, i) => (
                    <SuggestionCard 
                      key={i} 
                      title={s.title}
                      desc={s.desc}
                      type="saving" 
                      index={i} 
                    />
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

        {/* Chatbot Section */}
        <section className="pt-12 space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-[#00ff8815] flex items-center justify-center border border-[#00ff88]/20 text-[#00ff88]">
                <MessageCircle size={20} />
             </div>
             <div>
                <h2 className="text-xl font-black text-white tracking-tight">Ask Advisor</h2>
                <p className="text-[#555] text-xs font-medium">Clear your doubts about investments and planning.</p>
             </div>
          </div>

          <div className="bg-[#111311] border border-[#1a1f1a] rounded-3xl overflow-hidden flex flex-col h-[500px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-[#1a1f1a]">
              {messages.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 ${
                    m.role === 'user' ? 'bg-[#00ff88] text-black' : 'bg-[#1a1f1a] text-[#00ff88]'
                  }`}>
                    {m.role === 'user' ? <User size={14} /> : <Brain size={14} />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-[#00ff8810] border border-[#00ff88]/20 text-white' 
                      : 'bg-[#151a15] border border-white/5 text-[#ccc]'
                  }`}>
                    {m.content}
                  </div>
                </motion.div>
              ))}
              {chatLoading && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-[#1a1f1a] text-[#00ff88] flex items-center justify-center flex-shrink-0">
                    <Brain size={14} className="animate-pulse" />
                  </div>
                  <div className="bg-[#151a15] border border-white/5 rounded-2xl px-4 py-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#00ff88] rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-[#00ff88] rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-[#00ff88] rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Selection Chips */}
            <div className="px-6 py-3 flex gap-2 overflow-x-auto no-scrollbar border-t border-white/5 bg-[#0d0f0d]">
               {["Worst SIP performing?", "What is CAGR?", "Direct vs Regular SIP?", "Retirement planning?"].map((q) => (
                 <button 
                  key={q}
                  onClick={() => setChatInput(q)}
                  className="whitespace-nowrap bg-[#1a1f1a] hover:bg-[#222] text-[#666] hover:text-[#00ff88] text-[10px] font-black tracking-widest uppercase px-4 py-2 rounded-xl border border-white/5 transition-all"
                 >
                   {q}
                 </button>
               ))}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-[#0a0a0a] border-t border-white/5 flex gap-3">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask your investment doubt..."
                className="flex-1 bg-[#111311] border border-[#1a1f1a] focus:border-[#00ff88]/50 rounded-2xl px-5 text-sm text-white focus:outline-none transition-all"
              />
              <button 
                type="submit"
                disabled={!chatInput.trim() || chatLoading}
                className="w-12 h-12 bg-[#00ff88] hover:bg-[#00e87a] disabled:opacity-50 text-black rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,255,136,0.2)] transition-all"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </section>
      </section>
    </motion.div>
  );
}

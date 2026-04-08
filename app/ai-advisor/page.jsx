"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Brain, PlusCircle, Trash2, Loader2, ChevronRight } from "lucide-react";
import SuggestionCard from "@/components/ai-advisor/SuggestionCard";
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const STATS = [
  { label: "INCOME", value: "₹25,000", color: "text-white" },
  { label: "UNAVOIDABLE", value: "₹12,100", color: "text-white" },
  { label: "AVOIDABLE", value: "₹7,000", color: "text-yellow-400" },
  { label: "SAVINGS", value: "₹5,900", color: "text-[#00ff88]" },
];

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
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionError, setSuggestionError] = useState(null);

  const [expenses, setExpenses] = useState([]);
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [categorized, setCategorized] = useState([]);
  const [loadingCategorize, setLoadingCategorize] = useState(false);
  const [categorizeError, setCategorizeError] = useState(null);
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

  async function handleGetAnalysis() {
    setLoadingSuggestions(true);
    setSuggestions([]);
    setSuggestionError(null);
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ income: 25000, unavoidable: 12100, avoidable: 7000, savings: 5900 }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSuggestions(data.suggestions);
    } catch (e) {
      setSuggestionError(e.message);
    } finally {
      setLoadingSuggestions(false);
    }
  }

  function handleAddExpense() {
    if (!expenseName.trim() || !expenseAmount) return;
    setExpenses((prev) => [...prev, { title: expenseName.trim(), amount: Number(expenseAmount) }]);
    setExpenseName("");
    setExpenseAmount("");
  }

  function handleRemoveExpense(index) {
    setExpenses((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleCategorize() {
    if (expenses.length === 0) return;
    setLoadingCategorize(true);
    setCategorized([]);
    setCategorizeError(null);
    try {
      const res = await fetch("/api/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expenses }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCategorized(data);
    } catch (e) {
      setCategorizeError(e.message);
    } finally {
      setLoadingCategorize(false);
    }
  }

  const investmentCards = suggestions.filter((s) => s.type === "investment");
  const savingCards = suggestions.filter((s) => s.type === "saving");

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
            onClick={handleGetAnalysis}
            disabled={loadingSuggestions}
            className="flex items-center gap-2 bg-[#00ff88] hover:bg-[#00e87a] text-black font-black text-sm px-5 py-2.5 rounded-xl transition-all shadow-[0_0_20px_rgba(0,255,136,0.25)] hover:shadow-[0_0_30px_rgba(0,255,136,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loadingSuggestions ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Sparkles size={15} />
            )}
            {loadingSuggestions ? "Analyzing..." : "Get AI Analysis"}
          </button>
        </div>

        {suggestionError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
            ⚠ {suggestionError}
          </div>
        )}

        {/* Skeletons */}
        {loadingSuggestions && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Results */}
        {suggestions.length > 0 && !loadingSuggestions && (
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
      </section>

      {/* Divider */}
      <div className="border-t border-[#1a1f1a]" />

      {/* Categorize Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white">Categorize My Expenses</h2>
          <p className="text-[#555] text-xs mt-0.5">Add your expenses and let AI decide what&apos;s avoidable.</p>
        </div>

        {/* Input Row */}
        <div className="flex gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Expense name (e.g. Netflix)"
            value={expenseName}
            onChange={(e) => setExpenseName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddExpense()}
            className="flex-1 min-w-[200px] bg-[#111311] border border-[#1a1f1a] text-white placeholder-[#444] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#00ff8850] transition-colors"
          />
          <input
            type="number"
            placeholder="Amount ₹"
            value={expenseAmount}
            onChange={(e) => setExpenseAmount(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddExpense()}
            className="w-36 bg-[#111311] border border-[#1a1f1a] text-white placeholder-[#444] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#00ff8850] transition-colors"
          />
          <button
            onClick={handleAddExpense}
            className="flex items-center gap-2 bg-[#00ff8815] border border-[#00ff8830] hover:bg-[#00ff8825] text-[#00ff88] font-bold text-sm px-4 py-2.5 rounded-xl transition-all"
          >
            <PlusCircle size={15} />
            Add
          </button>
        </div>

        {/* Expense List */}
        {expenses.length > 0 && (
          <div className="space-y-2">
            {expenses.map((exp, i) => (
              <div key={i} className="flex items-center justify-between bg-[#111311] border border-[#1a1f1a] rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <ChevronRight size={14} className="text-[#00ff88]" />
                  <span className="text-white text-sm font-medium">{exp.title}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[#888] text-sm font-bold">₹{exp.amount.toLocaleString()}</span>
                  <button onClick={() => handleRemoveExpense(i)} className="text-[#444] hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={handleCategorize}
              disabled={loadingCategorize}
              className="mt-2 flex items-center gap-2 bg-[#00ff88] hover:bg-[#00e87a] text-black font-black text-sm px-5 py-2.5 rounded-xl transition-all shadow-[0_0_20px_rgba(0,255,136,0.25)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loadingCategorize ? <Loader2 size={15} className="animate-spin" /> : <Brain size={15} />}
              {loadingCategorize ? "Analyzing..." : "Analyze with AI"}
            </button>
          </div>
        )}

        {categorizeError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
            ⚠ {categorizeError}
          </div>
        )}

        {/* Categorized Results */}
        {categorized.length > 0 && (
          <div className="space-y-3">
            <p className="text-[11px] font-black tracking-[0.2em] text-[#555] uppercase">Analysis Results</p>
            {categorized.map((item, i) => (
              <div key={i} className="bg-[#111311] border border-[#1a1f1a] rounded-2xl px-5 py-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold text-sm">{item.title}</span>
                    <span className="text-[#888] text-xs font-bold">₹{Number(item.amount).toLocaleString()}</span>
                  </div>
                  <p className="text-[#666] text-xs leading-relaxed">{item.reason}</p>
                </div>
                <span
                  className={`flex-shrink-0 text-[10px] font-black tracking-wider px-3 py-1 rounded-full ${
                    item.category === "unavoidable"
                      ? "bg-[#00ff8820] text-[#00ff88]"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {item.category?.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}

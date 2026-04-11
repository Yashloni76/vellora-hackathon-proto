'use client'

import React, { useEffect } from "react";
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import { investments, balance } from "@/data/dummy";
import { 
  TrendingUp, 
  Coins, 
  PiggyBank, 
  BarChart2, 
  Wallet, 
  Percent, 
  Star, 
  Brain,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const iconMap = {
  "trending-up": TrendingUp,
  "coins": Coins,
  "piggy-bank": PiggyBank,
  "bar-chart": BarChart2,
};

const InvestmentsPage = () => {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading])

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-[var(--bg-primary)]">
      <div className="text-[#00ff88] text-xl">Loading...</div>
    </div>
  )

  if (!user) return null
  // Summary calculations
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const portfolioReturns = "+8.9%"; // Static as per request
  const bestPerformer = "Nifty 50"; // Static as per request

  return (
    <div className="p-10 max-w-7xl mx-auto min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Title & Subtitle */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-12"
      >
        <h1 className="text-5xl font-black tracking-tight mb-3 bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-primary)]/60 bg-clip-text text-transparent">
          Investment Portfolio
        </h1>
        <p className="text-[var(--text-muted)] text-xl font-medium uppercase tracking-[0.1em]">AI suggested investment tracker</p>
      </motion.div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-8 rounded-3xl group transition-all"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
              <Wallet size={24} />
            </div>
            <p className="text-[var(--text-muted)] text-xs font-black uppercase tracking-[0.2em]">Total Invested</p>
          </div>
          <h3 className="text-4xl font-black text-[var(--text-primary)]">₹{totalInvested.toLocaleString()}</h3>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-8 rounded-3xl group transition-all"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-[#00ff88]/10 text-[#00ff88]">
              <Percent size={24} />
            </div>
            <p className="text-[var(--text-muted)] text-xs font-black uppercase tracking-[0.2em]">Portfolio Returns</p>
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-4xl font-black text-[#00ff88]">{portfolioReturns}</h3>
            <ArrowUpRight className="text-[#00ff88]" size={28} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-8 rounded-2xl group transition-all"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <Star size={24} />
            </div>
            <p className="text-[var(--text-muted)] text-xs font-black uppercase tracking-[0.2em]">Best Performer</p>
          </div>
          <h3 className="text-3xl font-black text-[var(--text-primary)]">{bestPerformer}</h3>
        </motion.div>
      </div>

      {/* Investment List Cards */}
      <div className="grid grid-cols-1 gap-6 mb-16">
        {investments.map((inv, i) => {
          const Icon = iconMap[inv.icon] || TrendingUp;
          const isNegative = inv.returns.startsWith("-");

          return (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="p-6 px-10 rounded-[2rem] flex flex-col md:flex-row items-center justify-between group transition-all duration-500"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-8 w-full md:w-auto">
                <div className="p-5 rounded-2xl bg-[var(--bg-primary)] text-[#00ff88] group-hover:bg-[#00ff88] group-hover:text-black transition-all duration-500">
                  <Icon size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>{inv.title}</h3>
                  <div className="flex items-center gap-3 mt-1.5 font-bold uppercase tracking-widest text-[10px]">
                    <span style={{ color: 'var(--text-muted)' }}>{inv.type}</span>
                    <span className="opacity-20">•</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-md border",
                      inv.status === "ACTIVE" 
                        ? "bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/20" 
                        : "bg-yellow-400/10 text-yellow-400 border-yellow-400/20"
                    )}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-16 w-full md:w-auto mt-6 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-[var(--border)]">
                <div className="text-center md:text-right">
                  <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest mb-1">Monthly Invested</p>
                  <p className="text-xl font-black tracking-tight text-[var(--text-primary)]">₹{inv.amount.toLocaleString()}</p>
                </div>
                <div className="text-center md:text-right min-w-[100px]">
                  <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest mb-1">Total Returns</p>
                  <div className={cn(
                    "flex items-center justify-end gap-1 text-2xl font-black",
                    isNegative ? "text-red-500" : "text-[#00ff88]"
                  )}>
                    {inv.returns}
                    {isNegative ? <ArrowDownRight size={24} /> : <ArrowUpRight size={24} />}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* AI Suggestion Banner */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-[var(--bg-card)] border-2 border-[#00ff88]/20 p-10 rounded-[3rem] relative overflow-hidden group hover:border-[#00ff88]/40 transition-all"
      >
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="p-6 rounded-[2rem] bg-[#00ff88]/10 text-[#00ff88] animate-pulse">
            <Brain size={48} strokeWidth={1.5} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <p className="text-2xl font-black leading-tight text-[var(--text-primary)]/90 group-hover:text-[var(--text-primary)] transition-colors">
              Based on your <span className="text-[#00ff88]">₹{balance.toLocaleString()}</span> monthly savings, consider 
              increasing your SIP by <span className="text-[#00ff88]">₹500</span> for better compounding.
            </p>
            <p className="text-[var(--text-muted)] text-xs font-black uppercase tracking-[0.2em] mt-4 opacity-50">
              Powered by Claude AI
            </p>
          </div>
          <button className="bg-[#00ff88] text-[var(--bg-primary)] px-8 py-4 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,255,136,0.2)]">
            Review Plan
          </button>
        </div>

        {/* Abstract background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ff88]/5 rounded-full blur-[100px] pointer-events-none" />
      </motion.div>
    </div>
  );
};

export default InvestmentsPage;

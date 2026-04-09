"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Plus, X } from "lucide-react";
import BalanceCard from "@/components/dashboard/BalanceCard";
import ExpenseList from "@/components/dashboard/ExpenseList";
import StatsRow from "@/components/dashboard/StatsRow";
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
          <h1 className="text-3xl font-bold tracking-tight text-white">Expense Dashboard</h1>
          <p className="text-muted text-sm font-medium">Manage your architectural financial flow.</p>
        </div>

        <div className="flex items-center gap-6">
          <button className="relative w-10 h-10 rounded-xl bg-gray-900 border border-border-dark flex items-center justify-center hover:bg-gray-800 transition-colors">
            < Bell size={18} className="text-muted" />
            <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red border-2 border-gray-900 shadow-[0_0_8px_rgba(255,68,68,0.5)]" />
          </button>
          
          <div className="flex items-center gap-3 pl-4 border-l border-border-dark/30">
            <div className="text-right">
              <p className="text-[11px] font-bold text-white tracking-widest uppercase">SYMP USER</p>
              <p className="text-[9px] font-medium text-[#00ff88]">ARCHITECT TIER</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00ff88]/20 to-transparent border border-border-dark/50 flex items-center justify-center text-[#00ff88] font-bold text-sm">
              SY
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Sections */}
      <section className="space-y-12">
        <BalanceCard />
        <ExpenseList />
        <StatsRow />
      </section>

      {/* Floating Action Button */}
      <div className="fixed bottom-10 right-10 z-50">
        <button 
          onClick={() => setIsDialogOpen(true)}
          className="w-14 h-14 bg-[#00ff88] text-black rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(0,255,136,0.3)] hover:scale-110 active:scale-95 transition-all duration-300 group"
        >
           <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
        <div className="absolute -top-12 right-0 bg-[#111311] border border-border-dark px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
           <span className="text-[10px] text-[#00ff88] font-bold tracking-widest uppercase">Quick Add</span>
        </div>
      </div>

      {/* Simple Dialog Modal */}
      <AnimatePresence>
        {isDialogOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-[#111311] border border-border-dark rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[3px] bg-[#00ff88]" />
              
              <div className="flex justify-between items-center mb-8">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-white tracking-tight">Add Expense</h2>
                  <p className="text-xs text-muted font-medium uppercase tracking-widest">Entry portal v1.0</p>
                </div>
                <button 
                  onClick={() => setIsDialogOpen(false)}
                  className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-muted hover:text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted tracking-widest uppercase ml-1">Expense Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Starbucks Coffee"
                    className="w-full bg-[#0a0a0a] border border-border-dark rounded-2xl px-5 py-4 text-sm text-white focus:border-[#00ff88] outline-none transition-all placeholder-gray-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted tracking-widest uppercase ml-1">Amount</label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#00ff88] font-bold">₹</span>
                      <input 
                        type="number" 
                        placeholder="0.00"
                        className="w-full bg-[#0a0a0a] border border-border-dark rounded-2xl pl-10 pr-5 py-4 text-sm text-white focus:border-[#00ff88] outline-none transition-all placeholder-gray-800"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted tracking-widest uppercase ml-1">Category</label>
                    <select className="w-full bg-[#0a0a0a] border border-border-dark rounded-2xl px-5 py-4 text-sm text-white focus:border-[#00ff88] outline-none transition-all appearance-none cursor-pointer">
                      <option>Avoidable</option>
                      <option>Unavoidable</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1 py-4 rounded-2xl border border-border-dark text-muted font-bold text-xs uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1 py-4 rounded-2xl bg-[#00ff88] text-black font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all glow"
                  >
                    Save Entry
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

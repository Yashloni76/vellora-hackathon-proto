'use client'

import React, { useState, useEffect } from "react";
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import { journalEntries } from "@/data/dummy";
import { 
  Smile, 
  Frown, 
  Meh, 
  Plus, 
  X, 
  Calendar, 
  Quote,
  TrendingUp,
  TrendingDown,
  Dot
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const moodConfig = {
  HAPPY: { label: "Happy", emoji: "😊", color: "text-[#00ff88]", bg: "bg-[#00ff88]/10", border: "border-[#00ff88]/20" },
  REGRET: { label: "Regret", emoji: "😞", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
  NEUTRAL: { label: "Neutral", emoji: "😐", color: "text-gray-400", bg: "bg-gray-400/10", border: "border-gray-400/20" },
};

const JournalPage = () => {
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

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState("HAPPY");

  // Mood counts
  const counts = {
    HAPPY: journalEntries.filter(e => e.mood === "HAPPY").length,
    REGRET: journalEntries.filter(e => e.mood === "REGRET").length,
    NEUTRAL: journalEntries.filter(e => e.mood === "NEUTRAL").length,
  };

  return (
    <div className="p-10 max-w-6xl mx-auto min-h-screen text-[var(--text-primary)] bg-primary">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-12"
      >
        <h1 className="text-5xl font-black tracking-tight mb-3 bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-primary)]/60 bg-clip-text text-transparent">
          Financial Journal
        </h1>
        <p className="text-muted text-xl font-medium">Track emotions and experiences around money</p>
      </motion.div>

      {/* Mood Summary Row */}
      <div className="flex flex-wrap gap-4 mb-12">
        {Object.entries(moodConfig).map(([key, config], i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "px-6 py-3 rounded-2xl border flex items-center gap-3 transition-all",
              config.bg, config.border, config.color
            )}
          >
            <span className="text-xl">{config.emoji}</span>
            <span className="font-black uppercase tracking-widest text-xs">
              {config.label}: {counts[key]}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Journal entries */}
      <div className="space-y-8 mb-20">
        {journalEntries.map((entry, i) => {
          const config = moodConfig[entry.mood] || moodConfig.NEUTRAL;
          const isWin = entry.tag === "WIN";
          const isLoss = entry.tag === "LOSS";

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="group relative bg-card border border-border-dark p-8 md:p-10 rounded-[2.5rem] hover:border-white/10 transition-all duration-500 overflow-hidden"
            >
              {/* Date Badge */}
              <div className="absolute top-8 right-10 flex items-center gap-2 text-muted uppercase tracking-[0.2em] font-black text-[10px]">
                <Calendar size={12} />
                {entry.date}
              </div>

              {/* Entry Content */}
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className={cn("px-4 py-1.5 rounded-full text-xs font-black tracking-widest border flex items-center gap-2", config.bg, config.border, config.color)}>
                    <span>{config.emoji}</span>
                    {entry.mood}
                  </div>
                </div>

                <h3 className="text-3xl font-black mb-4 group-hover:text-[#00ff88] transition-colors">{entry.title}</h3>
                <p className="text-lg text-muted leading-relaxed mb-8 max-w-3xl italic">
                  "{entry.body}"
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <div className={cn(
                    "px-5 py-2 rounded-xl text-xs font-black tracking-widest border flex items-center gap-2",
                    isWin ? "border-[#00ff88]/40 bg-[#00ff88]/5 text-[#00ff88]" : 
                    isLoss ? "border-red-500/40 bg-red-500/5 text-red-500" : 
                    "border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-muted)]"
                  )}>
                    {isWin && <TrendingUp size={14} />}
                    {isLoss && <TrendingDown size={14} />}
                    {entry.tag}
                  </div>
                  <div className="text-xl font-black text-white/80">
                    ₹{entry.amount.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Decorative Quote mark */}
              <div className="absolute -bottom-6 -right-6 text-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rotate-12">
                <Quote size={180} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add New Button and Dialog */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-4 bg-[#00ff88] text-[#0a0a0a] px-10 py-5 rounded-[2rem] font-black text-xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_60px_rgba(0,255,136,0.3)] transition-all"
        >
          <Plus size={28} strokeWidth={3} />
          Add Journal Entry
        </motion.button>
      </div>

      {/* Styled Dialog UI */}
      <AnimatePresence>
        {isDialogOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDialogOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-xl bg-card border border-[var(--border)] p-10 rounded-[3rem] shadow-2xl"
            >
              <button
                onClick={() => setIsDialogOpen(false)}
                className="absolute top-8 right-8 text-muted hover:text-[var(--text-primary)] transition-colors"
              >
                <X size={32} />
              </button>

              <h2 className="text-4xl font-black tracking-tight mb-2 text-[var(--text-primary)]">New Entry</h2>
              <p className="text-[var(--text-muted)] font-medium mb-10 text-lg">Document your financial mindset.</p>

              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-4">Mood Selector</label>
                  <div className="flex gap-4">
                    {Object.entries(moodConfig).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedMood(key)}
                        className={cn(
                          "flex-1 p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                          selectedMood === key 
                            ? cn("scale-105", config.border, config.bg, config.color)
                            : "border-[var(--border)] hover:border-[#00ff88]/30 grayscale opacity-50"
                        )}
                      >
                        <span className="text-3xl">{config.emoji}</span>
                        <span className="font-black text-[9px] uppercase tracking-tighter">{config.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <input
                      placeholder="Give it a title..."
                      className="w-full bg-white/5 border-2 border-white/5 rounded-2xl px-6 py-4 font-bold text-lg text-white focus:outline-none focus:border-[#00ff88]/50 transition-all"
                    />
                  </div>
                  <div>
                    <textarea
                      placeholder="How did you feel about this transaction?"
                      rows={3}
                      className="w-full bg-white/5 border-2 border-white/5 rounded-2xl px-6 py-4 font-bold text-white focus:outline-none focus:border-[#00ff88]/50 transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-muted font-bold tracking-widest text-xl">₹</span>
                    <input
                      type="number"
                      placeholder="Amount"
                      className="w-full bg-white/5 border-2 border-white/5 rounded-2xl pl-12 pr-6 py-4 font-black text-xl text-white focus:outline-none focus:border-[#00ff88]/50 transition-all"
                    />
                  </div>
                  <div className="flex bg-white/5 border-2 border-white/5 rounded-2xl p-1">
                    <button className="flex-1 bg-[#00ff88] text-black font-black text-xs uppercase tracking-widest py-3 rounded-xl transition-all">WIN</button>
                    <button className="flex-1 text-muted font-black text-xs uppercase tracking-widest py-3 rounded-xl hover:text-white transition-all">LOSS</button>
                  </div>
                </div>

                <button
                  className="w-full bg-[#00ff88] text-[#0a0a0a] py-5 rounded-2xl font-black text-xl hover:shadow-[0_10px_30px_rgba(0,255,136,0.2)] transition-all mt-4"
                >
                  Save Entry
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JournalPage;

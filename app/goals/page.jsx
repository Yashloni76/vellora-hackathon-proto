'use client'

import React, { useState, useEffect } from "react";
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import { goals } from "@/data/dummy";
import { Shield, Laptop, Plane, Target, Plus, X, Calendar, TrendingUp, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const iconMap = {
  shield: Shield,
  laptop: Laptop,
  plane: Plane,
};

const GoalsPage = () => {
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

  // Goal logic calculations
  const totalGoals = goals.length;
  // A goal is on track if it has more than 50% progress (mock logic)
  const onTrackGoals = goals.filter((g) => (g.current / g.target) >= 0.5 && (g.current / g.target) < 1).length;
  const completedGoals = goals.filter((g) => g.current >= g.target).length;

  const getProgressColor = (percent) => {
    if (percent >= 70) return "bg-[#00ff88]";
    if (percent >= 40) return "bg-yellow-400";
    return "bg-red-500";
  };


  const getProgressShadow = (percent) => {
    if (percent >= 70) return "shadow-[0_0_15px_rgba(0,255,136,0.3)]";
    if (percent >= 40) return "shadow-[0_0_15px_rgba(250,204,21,0.3)]";
    return "shadow-[0_0_15px_rgba(239,68,68,0.3)]";
  };

  const getBadgeStyles = (percent) => {
    if (percent >= 70) return "bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/20";
    if (percent >= 40) return "bg-yellow-400/10 text-yellow-400 border-yellow-400/20";
    return "bg-red-500/10 text-red-500 border-red-500/20";
  };

  return (
    <div className="p-10 max-w-7xl mx-auto min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Title & Subtitle */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-12"
      >
        <h1 className="text-5xl font-black tracking-tight mb-3 bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-primary)]/60 bg-clip-text text-transparent">
          Financial Goals
        </h1>
        <p className="text-muted text-xl font-medium">Track your saving milestones</p>
      </motion.div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { label: "Total Goals", value: totalGoals, icon: Target, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "On Track", value: onTrackGoals, icon: TrendingUp, color: "text-[#00ff88]", bg: "bg-[#00ff88]/10" },
          { label: "Completed", value: completedGoals, icon: CheckCircle2, color: "text-purple-400", bg: "bg-purple-400/10" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-3xl flex items-center gap-6 group hover:border-[var(--text-primary)]/10 transition-colors"
          >
            <div className={cn("p-5 rounded-2xl transition-transform group-hover:scale-110", stat.bg, stat.color)}>
              <stat.icon size={32} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-muted text-xs font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <h3 className="text-4xl font-black">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        {goals.map((goal, i) => {
          const percent = Math.min(Math.round((goal.current / goal.target) * 100), 100);
          const Icon = iconMap[goal.icon] || Target;
          const progressColor = getProgressColor(percent);
          const shadowStyle = getProgressShadow(percent);
          const badgeStyle = getBadgeStyles(percent);

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="p-8 rounded-[2.5rem] relative overflow-hidden group transition-all duration-500"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-10">
                <div className="flex items-center gap-5">
                  <div className="p-5 rounded-2xl bg-[var(--bg-primary)] text-[#00ff88] group-hover:bg-[#00ff88] group-hover:text-[var(--bg-primary)] transition-all duration-500 ease-out">
                    <Icon size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight group-hover:text-[#00ff88] transition-colors" style={{ color: 'var(--text-primary)' }}>{goal.title}</h3>
                    <div className="flex items-center gap-2 mt-1.5 text-muted transition-colors group-hover:text-white/60">
                      <Calendar size={14} />
                      <span className="text-sm font-bold uppercase tracking-wider">{goal.deadline}</span>
                    </div>
                  </div>
                </div>
                <div className={cn("px-4 py-1.5 rounded-full text-xs font-black tracking-widest border", badgeStyle)}>
                  {percent}%
                </div>
              </div>

              {/* Progress & Amounts */}
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-muted text-[10px] font-black uppercase tracking-widest">Current Balance</p>
                    <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>₹{goal.current.toLocaleString()}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-muted text-[10px] font-black uppercase tracking-widest">Target Goal</p>
                    <p className="text-xl font-bold text-[var(--text-primary)]/50">₹{goal.target.toLocaleString()}</p>
                  </div>
                </div>

                <div className="relative h-4 w-full bg-[var(--bg-primary)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 1.8, ease: [0.34, 1.56, 0.64, 1] }}
                    className={cn("h-full rounded-full relative", progressColor, shadowStyle)}
                  >
                    {/* Glossy overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                  </motion.div>
                </div>
              </div>

              {/* Abstract decorative element */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            </motion.div>
          );
        })}
      </div>

      {/* Footer / Add New Goal Button */}
      <div className="flex justify-center pb-20">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsDialogOpen(true)}
          className="group flex items-center gap-4 bg-[#00ff88] text-[var(--bg-primary)] px-10 py-5 rounded-[2rem] font-black text-xl hover:shadow-[0_0_30px_rgba(0,255,136,0.4)] transition-all"
        >
          <div className="p-1 rounded-lg bg-black/10 group-hover:rotate-90 transition-transform duration-300">
            <Plus size={24} strokeWidth={3} />
          </div>
          Add New Goal
        </motion.button>
      </div>

      {/* Styled Modal / Dialog */}
      <AnimatePresence>
        {isDialogOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDialogOpen(false)}
              className="absolute inset-0 bg-[var(--bg-primary)]/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="relative w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border)] p-10 rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)]"
            >
              <button
                onClick={() => setIsDialogOpen(false)}
                className="absolute top-8 right-8 text-muted hover:text-[var(--text-primary)] transition-colors"
              >
                <X size={30} />
              </button>

              <div className="mb-10">
                <h2 className="text-3xl font-black tracking-tight mb-2">New Goal</h2>
                <p className="text-muted font-medium">Set your next financial destination.</p>
              </div>

              <div className="space-y-8">
                <div className="group">
                  <label className="block text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-3 group-focus-within:text-[#00ff88] transition-colors">
                    Goal Title
                  </label>
                  <input
                    type="text"
                    placeholder="E.g. Digital Nomad Fund"
                    className="w-full bg-[var(--bg-primary)] border-2 border-[var(--border)] rounded-2xl px-6 py-4 font-bold text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#00ff88]/50 focus:bg-[#00ff88]/5 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-3 group-focus-within:text-[#00ff88] transition-colors">
                      Target Amount (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full bg-[var(--bg-primary)] border-2 border-[var(--border)] rounded-2xl px-6 py-4 font-bold text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#00ff88]/50 focus:bg-[#00ff88]/5 transition-all"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-3 group-focus-within:text-[#00ff88] transition-colors">
                      Deadline
                    </label>
                    <input
                      type="text"
                      placeholder="Jan 2026"
                      className="w-full bg-[var(--bg-primary)] border-2 border-[var(--border)] rounded-2xl px-6 py-4 font-bold text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#00ff88]/50 focus:bg-[#00ff88]/5 transition-all"
                    />
                  </div>
                </div>

                <button
                  className="w-full bg-[#00ff88] text-[var(--bg-primary)] py-5 rounded-2xl font-black text-lg hover:shadow-[0_10px_30px_rgba(0,255,136,0.2)] hover:bg-[#00ff88]/90 transition-all mt-4"
                >
                  Create Milestone
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GoalsPage;

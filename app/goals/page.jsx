'use client'

import React, { useState, useEffect } from "react";
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Shield, Laptop, Plane, Target, Plus, X, Calendar, TrendingUp, CheckCircle2, Rocket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const iconMap = {
  shield: Shield,
  laptop: Laptop,
  plane: Plane,
  rocket: Rocket,
  target: Target
};

const GoalsPage = () => {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading])

  // Data state
  const [goals, setGoals] = useState([])
  const [isLoadingGoals, setIsLoadingGoals] = useState(true)
  
  // UI state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  
  // Form state
  const [newTitle, setNewTitle] = useState("")
  const [newTarget, setNewTarget] = useState("")
  const [newDeadline, setNewDeadline] = useState("")

  useEffect(() => {
    if (!user) return
    fetchGoals()
  }, [user])

  const fetchGoals = async () => {
    setIsLoadingGoals(true)
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setGoals(data || [])
    } catch (err) {
      console.error("Error fetching goals:", err)
    } finally {
      setIsLoadingGoals(false)
    }
  }

  const handleCreateGoal = async (e) => {
    e.preventDefault()
    if (!newTitle || !newTarget || !newDeadline) return

    setIsAddingGoal(true)
    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([{
          title: newTitle,
          target: parseFloat(newTarget),
          current: 0,
          deadline: newDeadline,
          icon: 'target',
          user_id: user.id
        }])
        .select()

      if (error) throw error

      if (data) {
        setGoals([data[0], ...goals])
        setIsDialogOpen(false)
        setNewTitle("")
        setNewTarget("")
        setNewDeadline("")
      }
    } catch (err) {
      console.error("Error creating goal:", err)
      alert(`Failed to create goal: ${err.message || 'Unknown error'}`)
    } finally {
      setIsAddingGoal(false)
    }
  }

  // Goal logic calculations
  const totalGoals = goals.length;
  // Dynamic calculation for On Track (>50%)
  const onTrackGoals = goals.filter((g) => {
     const t = Number(g.target) || 1;
     const c = Number(g.current) || 0;
     const r = c / t;
     return r >= 0.5 && r < 1;
  }).length;
  const completedGoals = goals.filter((g) => {
     const t = Number(g.target) || 1;
     const c = Number(g.current) || 0;
     return c >= t;
  }).length;

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

  if (loading || (!user && !loading)) return (
    <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
      <div className="text-[#00ff88] text-xl font-bold tracking-widest uppercase animate-pulse">Loading...</div>
    </div>
  )

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen text-white bg-primary">
      {/* Title & Subtitle */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-12 flex justify-between items-end"
      >
        <div>
          <h1 className="text-5xl font-black tracking-tight mb-3 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Financial Goals
          </h1>
          <p className="text-[#6b7280] text-sm font-bold uppercase tracking-widest">Track your saving milestones</p>
        </div>
      </motion.div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { label: "Total Goals", value: totalGoals, icon: Target, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "On Track (>50%)", value: onTrackGoals, icon: TrendingUp, color: "text-[#00ff88]", bg: "bg-[#00ff88]/10" },
          { label: "Completed", value: completedGoals, icon: CheckCircle2, color: "text-purple-400", bg: "bg-purple-400/10" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#111311] border border-[#1f2b1f] p-6 rounded-3xl flex items-center gap-6 group hover:border-[#00ff88]/30 transition-colors"
          >
            <div className={cn("p-5 rounded-2xl transition-transform group-hover:scale-110", stat.bg, stat.color)}>
              <stat.icon size={32} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[#6b7280] text-xs font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <h3 className="text-4xl font-black text-white">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {isLoadingGoals ? (
         <div className="text-center py-20 text-[#6b7280] text-sm font-bold uppercase tracking-widest animate-pulse">
           Fetching active milestones...
         </div>
      ) : goals.length === 0 ? (
         <div className="text-center py-20 bg-[#111311] border border-[#1f2b1f] rounded-3xl mb-16">
           <Target size={48} className="mx-auto mb-6 text-[#6b7280] opacity-50" />
           <p className="text-xl font-bold text-white mb-2">No active goals found.</p>
           <p className="text-[#6b7280] text-sm font-medium">Create your first milestone to start tracking your journey.</p>
         </div>
      ) : (
        /* Goal Cards Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {goals.map((goal, i) => {
            const current = Number(goal.current) || 0;
            const target = Number(goal.target) || 1;
            const percent = Math.min(Math.round((current / target) * 100), 100);
            const Icon = iconMap[goal.icon?.toLowerCase()] || Target;
            const progressColor = getProgressColor(percent);
            const shadowStyle = getProgressShadow(percent);
            const badgeStyle = getBadgeStyles(percent);

            return (
              <motion.div
                key={goal.id || i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="bg-[#111311] border border-[#1f2b1f] p-8 rounded-[2.5rem] relative overflow-hidden group hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-[#00ff88]/20 transition-all duration-500"
              >
                {/* Card Header */}
                <div className="flex justify-between items-start mb-10">
                  <div className="flex items-center gap-5">
                    <div className="p-5 rounded-2xl bg-white/5 text-[#00ff88] group-hover:bg-[#00ff88] group-hover:text-black transition-all duration-500 ease-out z-10">
                      <Icon size={28} />
                    </div>
                    <div className="z-10">
                      <h3 className="text-2xl font-black tracking-tight group-hover:text-[#00ff88] transition-colors">{goal.title}</h3>
                      <div className="flex items-center gap-2 mt-1.5 text-[#6b7280] transition-colors group-hover:text-white/60">
                        <Calendar size={14} />
                        <span className="text-xs font-bold uppercase tracking-wider">{goal.deadline}</span>
                      </div>
                    </div>
                  </div>
                  <div className={cn("px-4 py-1.5 rounded-full text-xs font-black tracking-widest border z-10", badgeStyle)}>
                    {percent}%
                  </div>
                </div>

                {/* Progress & Amounts */}
                <div className="space-y-6 z-10 relative">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[#6b7280] text-[10px] font-black uppercase tracking-widest">Current Balance</p>
                      <p className="text-2xl font-black text-white">₹{current.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[#6b7280] text-[10px] font-black uppercase tracking-widest">Target Goal</p>
                      <p className="text-xl font-bold text-white/50">₹{target.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <div className="relative h-4 w-full bg-white/5 rounded-full overflow-hidden">
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
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#00ff88]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Footer / Add New Goal Button */}
      <div className="flex justify-center pb-20">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsDialogOpen(true)}
          className="group flex items-center gap-4 bg-[#00ff88] text-[#0a0a0a] px-10 py-5 rounded-[2rem] font-black text-xl hover:shadow-[0_0_30px_rgba(0,255,136,0.4)] transition-all"
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
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="relative w-full max-w-lg bg-[#111311] border border-[#1f2b1f] p-10 rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)]"
            >
              <button
                onClick={() => setIsDialogOpen(false)}
                className="absolute top-8 right-8 text-[#6b7280] hover:text-white transition-colors"
                type="button"
              >
                <X size={30} />
              </button>

              <div className="mb-10">
                <h2 className="text-3xl font-black tracking-tight mb-2 text-white">New Goal</h2>
                <p className="text-[#6b7280] text-sm font-bold uppercase tracking-widest">Set your next financial destination.</p>
              </div>

              <form onSubmit={handleCreateGoal} className="space-y-8">
                <div className="group">
                  <label className="block text-[10px] font-black text-[#6b7280] uppercase tracking-[0.2em] mb-3 group-focus-within:text-[#00ff88] transition-colors">
                    Goal Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="E.g. Digital Nomad Fund"
                    className="w-full bg-[#0a0a0a] border border-[#1f2b1f] rounded-2xl px-6 py-4 font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-[#00ff88]/50 focus:bg-[rgba(0,255,136,0.02)] transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-[10px] font-black text-[#6b7280] uppercase tracking-[0.2em] mb-3 group-focus-within:text-[#00ff88] transition-colors">
                      Target Amount (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newTarget}
                      onChange={e => setNewTarget(e.target.value)}
                      placeholder="0"
                      className="w-full bg-[#0a0a0a] border border-[#1f2b1f] rounded-2xl px-6 py-4 font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-[#00ff88]/50 focus:bg-[rgba(0,255,136,0.02)] transition-all"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-[10px] font-black text-[#6b7280] uppercase tracking-[0.2em] mb-3 group-focus-within:text-[#00ff88] transition-colors">
                      Deadline
                    </label>
                    <input
                      type="text"
                      required
                      value={newDeadline}
                      onChange={e => setNewDeadline(e.target.value)}
                      placeholder="Jan 2026"
                      className="w-full bg-[#0a0a0a] border border-[#1f2b1f] rounded-2xl px-6 py-4 font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-[#00ff88]/50 focus:bg-[rgba(0,255,136,0.02)] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isAddingGoal}
                  className="w-full bg-gradient-to-br from-[#00ff88] to-[#00cc6a] text-[#0a0a0a] py-5 rounded-2xl font-black text-lg hover:shadow-[0_10px_30px_rgba(0,255,136,0.2)] disabled:opacity-50 transition-all mt-4"
                >
                  {isAddingGoal ? "Creating..." : "Create Milestone"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GoalsPage;

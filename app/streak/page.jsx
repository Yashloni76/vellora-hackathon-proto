'use client'
import { useEffect } from "react";
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from "framer-motion";
import { Zap, Plus, CheckCircle2, Award, MoreHorizontal } from "lucide-react";
import HeatMap from "@/components/streak/HeatMap";
import ActiveStreakCard from "@/components/streak/ActiveStreakCard";
import MilestoneCards from "@/components/streak/MilestoneCards";
import { streakData, balance } from "@/data/dummy";

export default function StreakPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading])

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-primary">
      <div className="text-green-accent text-xl">Loading...</div>
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
      {/* Header Area */}
      <header className="flex justify-between items-start">
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-4xl font-black tracking-tight text-primary uppercase italic">Momentum Engine</h1>
          {/* Banner */}
          <div className="bg-[#00ff8815] border border-[#00ff8830] px-6 py-4 rounded-2xl flex items-center gap-4 group hover:bg-[#00ff8820] transition-all">
            <div className="w-10 h-10 rounded-full bg-green-accent flex items-center justify-center text-black shadow-[0_0_20px_rgba(0,255,136,0.4)]">
              <Zap size={20} fill="currentColor" />
            </div>
            <p className="text-sm font-bold text-primary leading-relaxed">
              Keep it up! Your <span className="text-green-accent">{streakData.currentStreak}-day streak</span> is helping you save <span className="underline decoration-[#00ff88] decoration-2 underline-offset-4">₹{balance.toLocaleString()}</span> this month.
            </p>
          </div>
        </div>

        {/* Global Rank */}
        <div className="bg-card border border-border-dark px-6 py-4 rounded-2xl text-right group hover:border-[#00ff8840] transition-colors">
          <p className="text-4xl font-black text-green-accent tracking-tighter leading-none mb-1 group-hover:scale-110 transition-transform">
             {streakData.globalRank}
          </p>
          <p className="text-[10px] text-muted font-bold tracking-[0.2em] uppercase">Global Velocity Rank</p>
        </div>
      </header>

      {/* Primary Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 h-[500px]">
        <HeatMap />
        <ActiveStreakCard />
      </div>

      {/* Progression Milestones */}
      <MilestoneCards />


      {/* Background flare */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-accent/5 rounded-full blur-[180px] pointer-events-none -z-10" />
    </motion.div>
  );
}


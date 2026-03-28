"use client";
import { motion } from "framer-motion";

import WhatIfSlider from "@/components/simulator/WhatIfSlider";
import { Info } from "lucide-react";

export default function SimulatorPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }}
      className="p-12 space-y-12 pb-24 relative min-h-screen"
    >
      {/* Header Area */}
      <header className="flex justify-between items-end">
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-2">
            <h1 className="text-4xl font-black tracking-tight text-white uppercase italic">What-If Simulator</h1>
            <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] mt-4 shadow-[0_0_10px_rgba(0,255,136,0.6)]" />
          </div>
          <p className="text-sm font-bold text-muted leading-relaxed uppercase tracking-widest italic opacity-80">
            &quot;Every ₹100 saved today is a brick in your future financial fortress. Adjust non-essentials to visualize your trajectory.&quot;
          </p>
        </div>

        <div className="hidden lg:flex items-center gap-3 px-6 py-3 bg-[#111311] border border-border-dark rounded-2xl group cursor-help transition-all hover:border-[#00ff8830]">
           <Info size={16} className="text-[#00ff88]" />
           <p className="text-[10px] text-muted font-black tracking-widest uppercase">Simulation logic v1.2</p>
        </div>
      </header>

      {/* Main Content Component */}
      <main className="relative z-10">
        <WhatIfSlider />
      </main>

      {/* Aesthetic background accent */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#00ff88]/5 rounded-full blur-[150px] pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-[#00ff88]/5 rounded-full blur-[150px] pointer-events-none -z-10" />
    </motion.div>
  );
}

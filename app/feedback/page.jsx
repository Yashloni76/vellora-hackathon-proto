"use client";

import React, { useState } from "react";
import { 
  Star, 
  CheckCircle2, 
  Bug, 
  ArrowRight,
  MessageSquare,
  Sparkles,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const categories = [
  "UI Design", 
  "AI Suggestions", 
  "Streak System", 
  "Analytics", 
  "Simulator", 
  "Performance", 
  "Other"
];

const FeedbackPage = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleCategory = (cat) => {
    setSelectedCategories(prev => 
      prev.includes(cat) 
        ? prev.filter(c => c !== cat) 
        : [...prev, cat]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      // Reset form (optional)
      setRating(0);
      setSelectedCategories([]);
      setFeedbackText("");
    }, 4000);
  };

  return (
    <div className="p-10 max-w-4xl mx-auto min-h-screen text-white bg-primary pb-32">
      {/* Title & Subtitle */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-12"
      >
        <h1 className="text-5xl font-black tracking-tight mb-3 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent italic">
          FEEDBACK
        </h1>
        <p className="text-muted text-xl font-medium uppercase tracking-[0.15em]">Help us improve SYMP</p>
      </motion.div>

      {/* Main Feedback Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border-dark p-10 md:p-14 rounded-[3rem] shadow-2xl relative overflow-hidden"
      >
        <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
          
          {/* Rating Section */}
          <div className="space-y-6">
            <label className="block text-sm font-black text-white/50 uppercase tracking-[0.2em]">
              How would you rate SYMP?
            </label>
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform active:scale-95"
                >
                  <Star 
                    size={48} 
                    strokeWidth={1.5}
                    className={cn(
                      "transition-all duration-300 drop-shadow-lg",
                      (hoverRating || rating) >= star 
                        ? "fill-[#00ff88] text-[#00ff88] scale-110" 
                        : "text-white/10"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Categories Section */}
          <div className="space-y-6">
            <label className="block text-sm font-black text-white/50 uppercase tracking-[0.2em]">
              Which areas can we improve?
            </label>
            <div className="flex flex-wrap gap-4">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={cn(
                    "px-6 py-3 rounded-2xl border-2 font-bold text-xs uppercase tracking-widest transition-all",
                    selectedCategories.includes(cat)
                      ? "bg-[#00ff88] text-black border-[#00ff88] shadow-[0_0_20px_rgba(0,255,136,0.2)]"
                      : "bg-white/5 text-white/40 border-white/5 hover:border-white/10 hover:bg-white/10"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Textarea Section */}
          <div className="space-y-6">
            <label className="block text-sm font-black text-white/50 uppercase tracking-[0.2em]">
              Tell us more...
            </label>
            <div className="relative group">
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                maxLength={500}
                placeholder="What's your experience so far?"
                className="w-full bg-[#0a0a0a] border-2 border-border-dark rounded-3xl p-8 min-h-[200px] text-lg font-medium placeholder:text-white/10 focus:outline-none focus:border-[#00ff88]/50 focus:bg-white/5 transition-all outline-none"
              />
              <div className="absolute bottom-6 right-8 text-xs font-black uppercase tracking-widest text-muted">
                {feedbackText.length} / 500
              </div>
            </div>
          </div>

          {/* Submit Button with Toast logic */}
          <div className="relative h-[80px]">
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.button
                  key="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-[#00ff88] text-[#0a0a0a] h-full rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 hover:shadow-[0_20px_60px_rgba(0,255,136,0.25)] transition-all"
                >
                  <Zap size={24} strokeWidth={3} />
                  SUBMIT FEEDBACK
                </motion.button>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  className="w-full h-full bg-[#00ff88]/10 border-2 border-[#00ff88]/40 rounded-[2rem] flex items-center justify-center gap-4 text-[#00ff88] font-black italic"
                >
                  <CheckCircle2 size={32} />
                  THANK YOU! WE'RE LISTENING.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>

        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#00ff88]/5 rounded-full blur-[100px] pointer-events-none" />
      </motion.div>

      {/* Bug Report Bottom Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-12 bg-[#00ff88]/5 border-2 border-[#00ff88]/20 p-10 rounded-[3rem] group hover:border-[#00ff88]/40 transition-all flex flex-col md:flex-row items-center justify-between gap-8"
      >
        <div className="flex items-center gap-6">
          <div className="p-5 rounded-2xl bg-[#00ff88]/10 text-red-400 group-hover:scale-110 transition-transform">
            <Bug size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-2xl font-black mb-1">Found a bug?</h3>
            <p className="text-muted font-bold tracking-tight">Report it directly to our team</p>
          </div>
        </div>
        <button className="px-10 py-4 rounded-2xl border-2 border-[#00ff88] text-[#00ff88] font-black uppercase tracking-widest hover:bg-[#00ff88] hover:text-[#0a0a0a] transition-all flex items-center gap-3 active:scale-95 group-hover:shadow-[0_0_20px_rgba(0,255,136,0.2)]">
          REPORT BUG
          <ArrowRight size={20} />
        </button>
      </motion.div>
    </div>
  );
};

export default FeedbackPage;

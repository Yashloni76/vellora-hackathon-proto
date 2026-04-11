"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Pencil, 
  ChevronDown, 
  TrendingUp, 
  Plus, 
  Target,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    incomeSource: "Freelance",
    incomeType: "PROFESSIONAL",
    amount: "45000",
    frequency: "Monthly",
    expenseName: "",
    expenseAmount: "",
    expenseCategory: "Food",
    savingsGoal: "15000"
  });

  const [expenseList, setExpenseList] = useState([
    { name: '', amount: '', category: 'Food', type: 'avoidable' }
  ])

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleContinueToGoals = async () => {
    if (!user) return
    
    const validExpenses = expenseList.filter(
      e => e.name.trim() && e.amount
    )
    
    if (validExpenses.length > 0) {
      const expensesToInsert = validExpenses.map(e => ({
        user_id: user.id,
        title: e.name.trim(),
        amount: parseFloat(e.amount),
        type: e.category === 'Utilities' || 
              e.category === 'Transport' ? 
              'unavoidable' : 'avoidable',
        mood: 'neutral',
        date: new Date().toISOString().split('T')[0]
      }))

      const { error } = await supabase
        .from('expenses')
        .insert(expensesToInsert)

      if (error) {
        console.error('Error saving expenses:', error)
      }
    }
    
    nextStep()
  }

  const handleFinish = async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      await supabase.from('income').insert({
        user_id: session.user.id,
        amount: parseFloat(formData.amount) || 0,
        month: new Date().toLocaleString('default', { month: 'short' }).toUpperCase()
      })
    }
    
    router.push('/dashboard')
  }

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0
    })
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col font-sans"
    >
      {/* Top Bar */}
      <header className="flex justify-between items-center px-12 py-8 border-b border-[var(--border)]">
        <div className="flex flex-col">
          <h2 className="text-[#00ff88] font-bold tracking-tighter text-lg leading-tight">SYMP&apos;s ONBOARDING</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex gap-1">
              {[1, 2, 3].map((s) => (
                <div 
                  key={s}
                  className={cn(
                    "h-1 rounded-full transition-all duration-300",
                    s <= step ? "w-8 bg-[#00ff88]" : "w-4 bg-[var(--bg-card)]"
                  )}
                />
              ))}
            </div>
            <span className="text-[10px] text-[var(--text-muted)] font-bold ml-2 tracking-widest">STEP 0{step}/03</span>
          </div>
        </div>
        <button className="text-[var(--text-muted)] font-bold text-[11px] tracking-widest hover:text-[var(--text-primary)] transition-colors">
          NEED HELP?
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-12 overflow-hidden relative">
        <AnimatePresence mode="wait" custom={step}>
          <motion.div
            key={step}
            custom={step}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 items-start"
          >
            {/* Step Content */}
            <div className="space-y-8">
              {step === 1 && (
                <Step1 
                  formData={formData} 
                  setFormData={setFormData} 
                  onContinue={nextStep} 
                />
              )}
              {step === 2 && (
                <Step2 
                  expenseList={expenseList}
                  setExpenseList={setExpenseList}
                  onContinue={handleContinueToGoals} 
                  onBack={prevStep}
                />
              )}
              {step === 3 && (
                <Step3 
                  formData={formData} 
                  setFormData={setFormData} 
                  onBack={prevStep}
                  onComplete={handleFinish}
                />
              )}
            </div>

            {/* Sidebar Card */}
            <div className="hidden lg:block">
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 relative overflow-hidden group hover:border-[#00ff88]/30 transition-colors">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-[#00ff88]" />
                <div className="w-10 h-10 bg-[#00ff8810] rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="text-[#00ff88]" size={20} />
                </div>
                <h3 className="text-[#00ff88] font-bold text-sm mb-2">Smart Analysis</h3>
                <p className="text-[var(--text-muted)] text-[11px] leading-relaxed">
                  SYMP&apos;s uses AI to categorize your income automatically. Connect your bank later for real-time tracking.
                </p>
                <div className="mt-6 pt-6 border-t border-[var(--border)]">
                   <div className="flex items-center gap-2 mb-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
                      <span className="text-[10px] text-[var(--text-muted)] font-bold tracking-wider">AI RECOMMENDATION</span>
                   </div>
                   <p className="text-[var(--text-primary)] text-[11px] font-medium leading-snug">
                     &quot;Most professionals save 20% on onboarding. We can set that as your default goal.&quot;
                   </p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </motion.div>
  );
}

function Step1({ formData, setFormData, onContinue }) {
  return (
    <div className="space-y-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-[var(--text-primary)]">Income Setup</h1>
        <p className="text-[var(--text-muted)] text-sm">Let&apos;s map out your financial inflow.</p>
      </div>

      <div className="card space-y-6 bg-[var(--bg-card)] border border-[var(--border)] p-8 rounded-2xl">
        {/* Source */}
        <div className="space-y-3">
          <label className="text-[10px] text-[var(--text-muted)] font-bold tracking-widest uppercase">Primary Source</label>
          <div className="relative">
            <input 
              type="text" 
              value={formData.incomeSource}
              onChange={(e) => setFormData({...formData, incomeSource: e.target.value})}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl px-4 py-4 text-sm focus:border-[#00ff88] outline-none transition-colors text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50"
            />
            <Pencil size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setFormData({...formData, incomeType: "PROFESSIONAL"})}
              className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider border transition-all",
                formData.incomeType === "PROFESSIONAL" 
                  ? "bg-[#00ff8815] text-[#00ff88] border-[#00ff88]" 
                  : "bg-transparent text-[var(--text-muted)] border-[var(--border)]"
              )}
            >
              PROFESSIONAL
            </button>
            <button 
              onClick={() => setFormData({...formData, incomeType: "STUDENT"})}
              className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider border transition-all",
                formData.incomeType === "STUDENT" 
                  ? "bg-[#00ff8815] text-[#00ff88] border-[#00ff88]" 
                  : "bg-transparent text-[var(--text-muted)] border-[var(--border)]"
              )}
            >
              STUDENT FRIENDLY
            </button>
          </div>
        </div>

        {/* Amount */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="text-[10px] text-[var(--text-muted)] font-bold tracking-widest uppercase">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00ff88] font-bold">₹</span>
              <input 
                type="text" 
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl pl-8 pr-4 py-4 text-sm focus:border-[#00ff88] outline-none transition-colors text-[var(--text-primary)]"
              />
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] text-[var(--text-muted)] font-bold tracking-widest uppercase">Frequency</label>
            <div className="relative">
              <select 
                value={formData.frequency}
                onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl px-4 py-4 text-sm focus:border-[#00ff88] outline-none appearance-none cursor-pointer transition-colors text-[var(--text-primary)]"
              >
                <option>Monthly</option>
                <option>Weekly</option>
                <option>Daily</option>
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Common Sources */}
        <div className="space-y-3 pt-2">
          <label className="text-[10px] text-[var(--text-muted)] font-bold tracking-widest uppercase">Common Sources</label>
          <div className="flex flex-wrap gap-2">
            {["Pocket Money", "Part-time Job", "Allowance"].map((src) => (
              <button 
                key={src}
                onClick={() => setFormData({...formData, incomeSource: src})}
                className="px-4 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[#00ff88]/30 transition-all font-medium"
              >
                {src}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 space-y-4">
        <button 
          onClick={onContinue}
          className="w-full bg-[#00ff88] text-black font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all glow text-[13px] uppercase tracking-wider"
        >
          Continue to Expenses
        </button>
        <button className="w-full text-[var(--text-muted)] hover:text-[var(--text-primary)] text-[11px] font-bold tracking-widest uppercase transition-colors">
          Skip for now
        </button>
      </div>
    </div>
  );
}

function Step2({ expenseList, setExpenseList, onContinue, onBack }) {
  const addAnotherExpense = () => {
    setExpenseList([...expenseList, 
      { name: '', amount: '', category: 'Food', type: 'avoidable' }
    ])
  }

  return (
    <div className="space-y-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-[var(--text-primary)]">Add Expenses</h1>
        <p className="text-[var(--text-muted)] text-sm">What does a typical month look like?</p>
      </div>

      <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
        {expenseList.map((expense, index) => (
          <div key={index} className="card space-y-6 bg-[var(--bg-card)] relative border border-[var(--border)] p-6 rounded-xl">
            <div className="space-y-3">
              <label className="text-[10px] text-[var(--text-muted)] font-bold tracking-widest uppercase">Expense Name</label>
              <input 
                type="text" 
                placeholder="e.g. Rent, Netflix, Dining"
                value={expense.name}
                onChange={(e) => {
                  const updated = [...expenseList]
                  updated[index].name = e.target.value
                  setExpenseList(updated)
                }}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl px-4 py-4 text-sm focus:border-[#00ff88] outline-none transition-colors text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-[10px] text-[var(--text-muted)] font-bold tracking-widest uppercase">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00ff88] font-bold">₹</span>
                  <input 
                    type="number" 
                    value={expense.amount}
                    onChange={(e) => {
                      const updated = [...expenseList]
                      updated[index].amount = e.target.value
                      setExpenseList(updated)
                    }}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl pl-8 pr-4 py-4 text-sm focus:border-[#00ff88] outline-none transition-colors text-[var(--text-primary)]"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] text-[var(--text-muted)] font-bold tracking-widest uppercase">Category</label>
                <div className="relative">
                  <select 
                    value={expense.category}
                    onChange={(e) => {
                      const updated = [...expenseList]
                      updated[index].category = e.target.value
                      setExpenseList(updated)
                    }}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl px-4 py-4 text-sm focus:border-[#00ff88] outline-none appearance-none cursor-pointer transition-colors text-[var(--text-primary)]"
                  >
                    <option>Food</option>
                    <option>Transport</option>
                    <option>Entertainment</option>
                    <option>Utilities</option>
                    <option>Health</option>
                    <option>Other</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={addAnotherExpense}
        className="flex items-center justify-center gap-2 w-full py-3 border border-dashed border-[var(--border)] rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[#00ff88]/30 transition-all text-sm font-medium"
      >
        <Plus size={16} />
        Add another expense
      </button>

      <div className="pt-4 flex gap-4">
        <button 
          onClick={onBack}
          className="flex-1 border border-[var(--border)] text-[var(--text-primary)] font-bold py-4 rounded-xl hover:bg-[var(--text-primary)]/5 transition-all text-[13px] uppercase tracking-wider"
        >
          Back
        </button>
        <button 
          onClick={onContinue}
          className="flex-[2] bg-[#00ff88] text-black font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all glow text-[13px] uppercase tracking-wider"
        >
          Continue to Goals
        </button>
      </div>
    </div>
  );
}

function Step3({ formData, setFormData, onBack, onComplete }) {
  return (
    <div className="space-y-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-[var(--text-primary)]">Set Goals</h1>
        <p className="text-[var(--text-muted)] text-sm">Build wealth, one milestone at a time.</p>
      </div>

      <div className="card space-y-6 bg-[var(--bg-card)] border border-[var(--border)] p-8 rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] text-[var(--text-muted)] font-bold tracking-widest uppercase">Monthly Savings Goal</label>
          <div className="flex items-center gap-1">
             <Target size={12} className="text-[#00ff88]" />
             <span className="text-[10px] text-[#00ff88] font-bold">SMART TARGET</span>
          </div>
        </div>
        
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00ff88] font-bold">₹</span>
          <input 
            type="text" 
            value={formData.savingsGoal}
            onChange={(e) => setFormData({...formData, savingsGoal: e.target.value})}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl pl-8 pr-4 py-4 text-sm focus:border-[#00ff88] outline-none transition-colors text-[var(--text-primary)]"
          />
        </div>

        <div className="bg-[var(--bg-primary)] rounded-xl p-4 border border-[var(--border)]">
          <div className="flex justify-between text-[11px] font-bold mb-4">
            <span className="text-[var(--text-muted)]">PROJECTED YEARLY SAVINGS</span>
            <span className="text-[#00ff88]">₹{parseInt(formData.savingsGoal || 0) * 12}</span>
          </div>
          <div className="w-full h-2 bg-[var(--bg-card)] rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: "60%" }}
               className="h-full bg-[#00ff88] glow" 
             />
          </div>
          <p className="mt-3 text-[10px] text-[var(--text-muted)] leading-relaxed">
            This puts you in the top 15% of wealth builders in your bracket. Consistency is your superpower.
          </p>
        </div>
      </div>

      <div className="pt-4 flex gap-4">
        <button 
          onClick={onBack}
          className="flex-1 border border-[var(--border)] text-[var(--text-primary)] font-bold py-4 rounded-xl hover:bg-[var(--text-primary)]/5 transition-all text-[13px] uppercase tracking-wider"
        >
          Back
        </button>
        <button 
          onClick={onComplete}
          className="flex-[2] bg-[#00ff88] text-black font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all glow text-[13px] uppercase tracking-wider flex items-center justify-center gap-2"
        >
          Get Started
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

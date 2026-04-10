'use client'

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Plus, X } from "lucide-react";
import BalanceCard from "@/components/dashboard/BalanceCard";
import ExpenseList from "@/components/dashboard/ExpenseList";
import StatsRow from "@/components/dashboard/StatsRow";
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  // Setup flow states
  const [setupStep, setSetupStep] = useState(0) // 0 = checking, 1 = income, 2 = expenses, 3 = goal, 4 = done
  const [userIncome, setUserIncome] = useState(0)
  const [incomeInput, setIncomeInput] = useState('')
  const [goalInput, setGoalInput] = useState('')
  const [expenseName, setExpenseName] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenseType, setExpenseType] = useState('avoidable')
  const [addedExpenses, setAddedExpenses] = useState([])
  const [saving, setSaving] = useState(false)
  const [expenseMood, setExpenseMood] = useState('neutral')
  
  // Dashboard UI states
  const [open, setOpen] = useState(false)
  const [dbExpenses, setDbExpenses] = useState([])
  const [realBalance, setRealBalance] = useState(0)
  const [realSavings, setRealSavings] = useState(0)
  const [savingsVelocity, setSavingsVelocity] = useState('0.0')
  const [regretIndex, setRegretIndex] = useState('Low')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading])

  const checkUserSetup = async () => {
    if (!user) return
    const { data } = await supabase
      .from('users')
      .select('income, goal')
      .eq('id', user.id)
      .single()

    if (data && data.income && data.income > 0) {
      setUserIncome(data.income)
      setSetupStep(4)
      fetchAllData()
    } else {
      setSetupStep(1)
    }
  }

  const fetchAllData = async () => {
    if (!user) return
    setIsLoading(true)

    const { data: userData } = await supabase
      .from('users')
      .select('income, goal')
      .eq('id', user.id)
      .single()

    const income = Number(userData?.income) || 0
    setUserIncome(income)

    const { data: expenseData } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    const expenses = expenseData || []
    setDbExpenses(expenses)

    const totalSpent = expenses.reduce(
      (sum, e) => sum + Number(e.amount), 0
    )

    const balance = income - totalSpent
    setRealBalance(balance)
    setRealSavings(balance)

    const velocity = income > 0
      ? ((balance / income) * 100).toFixed(1)
      : '0.0'
    setSavingsVelocity(velocity)

    const avoidableTotal = expenses
      .filter(e => e.type === 'avoidable')
      .reduce((sum, e) => sum + Number(e.amount), 0)

    const regretRatio = income > 0
      ? (avoidableTotal / income) * 100
      : 0

    if (regretRatio < 20) setRegretIndex('Low')
    else if (regretRatio < 40) setRegretIndex('Medium')
    else setRegretIndex('High')

    setIsLoading(false)
  }

  useEffect(() => {
    if (user) {
      checkUserSetup()
    }
  }, [user])

  const handleSaveExpense = async () => {
    if (!user) return
    if (!expenseName.trim() || !expenseAmount) {
      alert('Please fill expense name and amount')
      return
    }
    
    setSaving(true)
    const { data, error } = await supabase
      .from('expenses')
      .insert([{
        user_id: user.id,
        title: expenseName.trim(),
        amount: parseFloat(expenseAmount),
        type: expenseType,
        mood: expenseMood,
        date: new Date().toISOString().split('T')[0]
      }])
      .select()

    if (data) {
      setOpen(false)
      setExpenseName('')
      setExpenseAmount('')
      setExpenseType('avoidable')
      fetchAllData()
    }
    setSaving(false)
  }

  const handleSetupIncome = async () => {
    if (!incomeInput) return
    setSaving(true)
    await supabase.from('users').upsert({
      id: user.id,
      email: user.email,
      income: parseFloat(incomeInput)
    })
    setUserIncome(parseFloat(incomeInput))
    setSaving(false)
    setSetupStep(2)
  }

  const handleAddSetupExpense = async () => {
    if (!expenseName || !expenseAmount) return
    setSaving(true)
    const newExp = {
      user_id: user.id,
      title: expenseName,
      amount: parseFloat(expenseAmount),
      type: expenseType,
      mood: 'neutral',
      date: new Date().toISOString().split('T')[0]
    }
    await supabase.from('expenses').insert([newExp])
    setAddedExpenses([...addedExpenses, newExp])
    setExpenseName('')
    setExpenseAmount('')
    setSaving(false)
  }

  const handleSetupGoal = async () => {
    if (!goalInput) return
    setSaving(true)
    await supabase.from('users').upsert({
      id: user.id,
      email: user.email,
      income: userIncome,
      goal: parseFloat(goalInput)
    })
    setSaving(false)
    setSetupStep(4)
    fetchAllData()
  }

  if (authLoading || (user && setupStep === 0)) return (
    <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
      <div className="text-[#00ff88] text-xl">Loading...</div>
    </div>
  )

  if (!user) return null

  // STEP 1: Income Setup
  if (setupStep === 1) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-[#111] border border-[#00ff88]/30 rounded-2xl p-8 shadow-2xl shadow-[#00ff88]/5"
        >
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-3xl font-bold text-white">Welcome to SYMP! 👋</h2>
            <p className="text-gray-400">Let's set up your finances in 3 quick steps</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-[#00ff88] text-xs font-bold uppercase tracking-wider">Step 1 of 3 — Monthly Income</span>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={incomeInput}
                  onChange={(e) => setIncomeInput(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl py-4 pl-10 pr-4 text-white focus:outline-none focus:border-[#00ff88]/50 transition-colors"
                />
              </div>
            </div>

            <button
              onClick={handleSetupIncome}
              disabled={!incomeInput || saving}
              className="w-full bg-[#00ff88] text-black font-bold py-4 rounded-xl hover:bg-[#00cc6e] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Next →'}
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // STEP 2: Expenses Setup
  if (setupStep === 2) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-[#111] border border-[#00ff88]/30 rounded-2xl p-8 shadow-2xl shadow-[#00ff88]/5"
        >
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-white">Step 2 of 3 — Add Your Expenses</h2>
            <p className="text-gray-400">Add your monthly expenses</p>
          </div>

          <div className="space-y-4 mb-8">
            <input
              type="text"
              placeholder="Expense Name (e.g. Rent)"
              value={expenseName}
              onChange={(e) => setExpenseName(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#00ff88]/50 transition-colors"
            />
            
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                placeholder="Amount"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#00ff88]/50 transition-colors"
              />
            </div>

            <select
              value={expenseType}
              onChange={(e) => setExpenseType(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#00ff88]/50 transition-colors appearance-none"
            >
              <option value="avoidable">Avoidable</option>
              <option value="unavoidable">Unavoidable</option>
            </select>

            <button
              onClick={handleAddSetupExpense}
              disabled={!expenseName || !expenseAmount || saving}
              className="w-full border border-[#00ff88]/50 text-[#00ff88] font-bold py-3 rounded-xl hover:bg-[#00ff88]/10 transition-all"
            >
              {saving ? 'Adding...' : 'Add Expense'}
            </button>
          </div>

          {addedExpenses.length > 0 && (
            <div className="max-h-32 overflow-y-auto space-y-2 mb-8 scrollbar-hide">
              {addedExpenses.map((exp, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-[#0a0a0a] border border-[#222] rounded-lg">
                  <span className="text-sm text-white">{exp.title}</span>
                  <span className="text-sm text-[#00ff88]">₹{exp.amount}</span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => setSetupStep(3)}
            className="w-full bg-[#00ff88] text-black font-bold py-4 rounded-xl hover:bg-[#00cc6e] transition-all"
          >
            Next →
          </button>
        </motion.div>
      </div>
    )
  }

  // STEP 3: Savings Goal
  if (setupStep === 3) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-[#111] border border-[#00ff88]/30 rounded-2xl p-8 shadow-2xl shadow-[#00ff88]/5"
        >
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-white">Step 3 of 3 — Set Your Savings Goal</h2>
            <p className="text-gray-400">How much do you want to save monthly?</p>
          </div>

          <div className="space-y-6">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                placeholder="Goal Amount"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl py-4 pl-10 pr-4 text-white focus:outline-none focus:border-[#00ff88]/50 transition-colors"
              />
            </div>

            <button
              onClick={handleSetupGoal}
              disabled={!goalInput || saving}
              className="w-full bg-[#00ff88] text-black font-bold py-4 rounded-xl hover:bg-[#00cc6e] transition-all"
            >
              {saving ? 'Finalizing...' : 'Get Started →'}
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // STEP 4: Real Dashboard
  const avoid = dbExpenses.filter(e => e.type === 'avoidable')
  const unavoid = dbExpenses.filter(e => e.type === 'unavoidable')

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
        <BalanceCard balance={isLoading ? 0 : realBalance} />
        <ExpenseList avoidable={avoid} unavoidable={unavoid} />
        <StatsRow 
          savingsVelocity={savingsVelocity} 
          savings={realSavings} 
          regretIndex={regretIndex} 
        />
      </section>

      {/* Floating Action Button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          zIndex: 9999,
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
          border: 'none',
          cursor: 'pointer',
          fontSize: '28px',
          color: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 0 0 rgba(0,255,136,0.4)',
          animation: 'pulse 2s infinite',
          fontWeight: 'bold'
        }}
      >
        +
      </button>

      {/* Simple Working Modal */}
      {open && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: '#111311',
            border: '1px solid #1f2b1f',
            borderRadius: '16px',
            padding: '28px',
            width: '420px',
            maxWidth: '90vw',
            boxShadow: '0 0 40px rgba(0,255,136,0.1)'
          }}>

            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <div>
                <h2 style={{
                  color: '#fff',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  margin: 0
                }}>
                  Add Expense
                </h2>
                <p style={{
                  color: '#6b7280',
                  fontSize: '12px',
                  margin: '4px 0 0 0'
                }}>
                  Track your spending instantly
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #1f2b1f',
                  borderRadius: '8px',
                  color: '#6b7280',
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Expense Name */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                color: '#6b7280',
                fontSize: '11px',
                letterSpacing: '1px',
                display: 'block',
                marginBottom: '8px'
              }}>
                EXPENSE NAME
              </label>
              <input
                type="text"
                placeholder="e.g. Netflix, Zomato, Rent"
                value={expenseName}
                onChange={e => setExpenseName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #1f2b1f',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = '#00ff88'}
                onBlur={e => e.target.style.borderColor = '#1f2b1f'}
              />
            </div>

            {/* Amount */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                color: '#6b7280',
                fontSize: '11px',
                letterSpacing: '1px',
                display: 'block',
                marginBottom: '8px'
              }}>
                AMOUNT
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#00ff88',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  ₹
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={expenseAmount}
                  onChange={e => setExpenseAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 30px',
                    backgroundColor: '#0a0a0a',
                    border: '1px solid #1f2b1f',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = '#00ff88'}
                  onBlur={e => e.target.style.borderColor = '#1f2b1f'}
                />
              </div>
            </div>

            {/* Type Toggle */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                color: '#6b7280',
                fontSize: '11px',
                letterSpacing: '1px',
                display: 'block',
                marginBottom: '8px'
              }}>
                EXPENSE TYPE
              </label>
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <button
                  onClick={() => setExpenseType('avoidable')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: expenseType === 'avoidable'
                      ? 'rgba(255,68,68,0.15)' : '#0a0a0a',
                    border: expenseType === 'avoidable'
                      ? '1px solid #ff4444' : '1px solid #1f2b1f',
                    borderRadius: '10px',
                    color: expenseType === 'avoidable'
                      ? '#ff4444' : '#6b7280',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s'
                  }}
                >
                  😬 Avoidable
                </button>
                <button
                  onClick={() => setExpenseType('unavoidable')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: expenseType === 'unavoidable'
                      ? 'rgba(0,255,136,0.1)' : '#0a0a0a',
                    border: expenseType === 'unavoidable'
                      ? '1px solid #00ff88' : '1px solid #1f2b1f',
                    borderRadius: '10px',
                    color: expenseType === 'unavoidable'
                      ? '#00ff88' : '#6b7280',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s'
                  }}
                >
                  ✅ Unavoidable
                </button>
              </div>
            </div>

            {/* Mood Selector */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                color: '#6b7280',
                fontSize: '11px',
                letterSpacing: '1px',
                display: 'block',
                marginBottom: '8px'
              }}>
                YOUR MOOD
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[
                  { value: 'happy', emoji: '😊' },
                  { value: 'neutral', emoji: '😐' },
                  { value: 'sad', emoji: '😢' },
                  { value: 'stressed', emoji: '😤' },
                  { value: 'excited', emoji: '🤩' }
                ].map(m => (
                  <button
                    key={m.value}
                    onClick={() => setExpenseMood(m.value)}
                    style={{
                      flex: 1,
                      padding: '10px 6px',
                      backgroundColor: expenseMood === m.value
                        ? 'rgba(0,255,136,0.1)' : '#0a0a0a',
                      border: expenseMood === m.value
                        ? '1px solid #00ff88' : '1px solid #1f2b1f',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '18px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {m.emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setOpen(false)}
                style={{
                  flex: 1,
                  padding: '13px',
                  backgroundColor: 'transparent',
                  border: '1px solid #1f2b1f',
                  borderRadius: '10px',
                  color: '#6b7280',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveExpense}
                disabled={saving}
                style={{
                  flex: 2,
                  padding: '13px',
                  background: saving
                    ? '#1f2b1f'
                    : 'linear-gradient(135deg, #00ff88, #00cc6a)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#000',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
              >
                {saving ? 'Saving...' : '+ Save Expense'}
              </button>
            </div>

          </div>
        </div>
      )}
    </motion.div>
  );
}

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
import { unavoidableExpenses as dummyUnavoidable, avoidableExpenses as dummyAvoidable } from "@/data/dummy"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [expenseName, setExpenseName] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenseType, setExpenseType] = useState('avoidable')
  const [expenses, setExpenses] = useState([])
  const [saving, setSaving] = useState(false)
  const [userIncome, setUserIncome] = useState(25000)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading])

  const fetchUserIncome = async () => {
    if (!user) return
    const { data } = await supabase
      .from('users')
      .select('income')
      .eq('id', user.id)
      .single()

    if (data && data.income) {
      setUserIncome(data.income)
    }
  }

  const fetchExpenses = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Fetch error:', error)
      return
    }
    if (data) setExpenses(data)
  }

  useEffect(() => {
    if (user) {
      fetchExpenses()
      fetchUserIncome()
    }
  }, [user])

  const handleSaveExpense = async () => {
    if (!user) {
      console.error('No user found')
      return
    }
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
        mood: 'neutral',
        date: new Date().toISOString().split('T')[0]
      }])
      .select()

    if (error) {
      console.error('Save error:', error)
      alert('Error saving: ' + error.message)
      setSaving(false)
      return
    }
    
    console.log('Saved successfully:', data)
    setOpen(false)
    setExpenseName('')
    setExpenseAmount('')
    setExpenseType('avoidable')
    setSaving(false)
    fetchExpenses()
  }

  const avoidable = expenses.filter(e => e.type === 'avoidable')
  const unavoidable = expenses.filter(e => e.type === 'unavoidable')
  const dbExpenses = expenses.length > 0 ? { avoidable, unavoidable } : null

  const totalExpenses = expenses.length > 0
    ? expenses.reduce((sum, e) => sum + e.amount, 0)
    : [...dummyUnavoidable, ...dummyAvoidable].reduce((sum, e) => sum + e.amount, 0)

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
        <BalanceCard totalExpenses={totalExpenses} userIncome={userIncome} />
        <ExpenseList data={dbExpenses || { avoidable: dummyAvoidable, unavoidable: dummyUnavoidable }} />
        <StatsRow totalExpenses={totalExpenses} userIncome={userIncome} />
      </section>

      {/* Floating Action Button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#00ff88',
          border: 'none',
          cursor: 'pointer',
          fontSize: '28px',
          color: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,255,136,0.4)'
        }}
      >
        +
      </button>

      {/* Simple Working Modal */}
      {open && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: '#111311',
            border: '1px solid #1f2b1f',
            borderRadius: '16px',
            padding: '32px',
            width: '400px',
            maxWidth: '90vw'
          }}>
            <h2 style={{ color: '#fff', marginBottom: '24px',
              fontSize: '20px', fontWeight: 'bold' }}>
              Add Expense
            </h2>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: '#6b7280', fontSize: '12px',
                display: 'block', marginBottom: '8px' }}>
                EXPENSE NAME
              </label>
              <input
                type="text"
                placeholder="e.g. Netflix, Rent, Food"
                value={expenseName}
                onChange={(e) => setExpenseName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #1f2b1f',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: '#6b7280', fontSize: '12px',
                display: 'block', marginBottom: '8px' }}>
                AMOUNT (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 500"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #1f2b1f',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ color: '#6b7280', fontSize: '12px',
                display: 'block', marginBottom: '8px' }}>
                TYPE
              </label>
              <select
                value={expenseType}
                onChange={(e) => setExpenseType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #1f2b1f',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                <option value="avoidable">Avoidable</option>
                <option value="unavoidable">Unavoidable</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setOpen(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: 'transparent',
                  border: '1px solid #1f2b1f',
                  borderRadius: '8px',
                  color: '#6b7280',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveExpense}
                disabled={saving}
                style={{
                  flex: 2,
                  padding: '12px',
                  backgroundColor: '#00ff88',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#000',
                  fontWeight: 'bold',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: saving ? 0.7 : 1
                }}
              >
                {saving ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

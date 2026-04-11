'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { useTheme } from '@/lib/ThemeContext'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Palette, DollarSign, Bell, 
  Lock, Octagon, Eye, EyeOff, 
  Check, AlertTriangle, AlertCircle,
  Loader2, Trash2
} from 'lucide-react'

// --- Local Components (since shadcn directory is missing) ---

const Switch = ({ checked, onCheckedChange, disabled }) => (
  <button
    disabled={disabled}
    onClick={() => onCheckedChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#00ff88] focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] ${
      checked ? 'bg-[#00ff88]' : 'bg-[#1f2b1f]'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
)

const AlertDialog = ({ open, title, description, onConfirm, onCancel, confirmText = 'Delete', confirmDisabled }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-center gap-3 text-red-500 mb-4">
          <AlertTriangle size={24} />
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
        <p className="text-[#6b7280] mb-6 leading-relaxed">{description}</p>
        <div className="flex justify-end gap-3">
          <button 
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-[#1a1f1a] text-white hover:bg-[#252a25] transition-colors"
          >
            Cancel
          </button>
          <button 
            disabled={confirmDisabled}
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              confirmDisabled 
                ? 'bg-red-500/20 text-red-500/50 cursor-not-allowed' 
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// --- Main Page ---

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const router = useRouter()

  // State
  const [activeTab, setActiveTab] = useState('profile')
  const [saveLoading, setSaveLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  // Form State
  const [fullName, setFullName] = useState('')
  const [currency, setCurrency] = useState('INR')
  const [monthlyIncome, setMonthlyIncome] = useState('')
  const [savingsGoal, setSavingsGoal] = useState('')
  
  // Notifications
  const [weeklyNotif, setWeeklyNotif] = useState(true)
  const [streakNotif, setStreakNotif] = useState(true)
  const [goalNotif, setGoalNotif] = useState(true)
  const [overspendNotif, setOverspendNotif] = useState(true)

  // Security
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passStrength, setPassStrength] = useState({ score: 0, label: 'Not entered', color: 'bg-gray-800' })

  // Danger Zone
  const [deleteInput, setDeleteInput] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Theme Logic - Removed local applyTheme and handleThemeToggle as they are now in ThemeContext

  // Fetch Initial Data
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      const fetchUserData = async () => {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (data) {
          setFullName(data.full_name || '')
          setCurrency(data.currency || 'INR')
          setMonthlyIncome(data.monthly_income || '')
          setSavingsGoal(data.savings_goal || '')
          setWeeklyNotif(data.notif_weekly !== false)
          setStreakNotif(data.notif_streak !== false)
          setGoalNotif(data.notif_goals !== false)
          setOverspendNotif(data.notif_overspend !== false)
        }
      }
      fetchUserData()
    }
  }, [user, authLoading])

  // Load saved theme on mount - Handled by ThemeContext

  // Password Strength Logic
  useEffect(() => {
    if (!newPassword) {
      setPassStrength({ score: 0, label: 'Not entered', color: 'bg-gray-800' })
      return
    }
    
    let score = 0
    if (newPassword.length >= 8) score += 1
    if (/[0-9]/.test(newPassword)) score += 1
    if (/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) score += 1
    
    if (newPassword.length < 8) {
      setPassStrength({ score: 33, label: 'Weak', color: 'bg-red-500' })
    } else if (score < 3) {
      setPassStrength({ score: 66, label: 'Fair', color: 'bg-yellow-500' })
    } else {
      setPassStrength({ score: 100, label: 'Strong', color: 'bg-[#00ff88]' })
    }
  }, [newPassword])

  // Save Handlers
  const handleSave = async (section, updateData) => {
    setSaveLoading(true)
    setMessage({ type: '', text: '' })

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)

    if (error) {
      setMessage({ type: 'error', text: `Failed to save ${section}: ${error.message}` })
    } else {
      setMessage({ type: 'success', text: `${section === 'Finance' ? 'Finance settings updated' : section === 'Appearance' ? 'Appearance saved' : section + ' updated successfully'}` })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
    setSaveLoading(false)
  }

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }
    setSaveLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    
    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Password updated successfully' })
      setNewPassword('')
      setConfirmPassword('')
    }
    setSaveLoading(false)
  }

  const handleDeleteAccount = async () => {
    setSaveLoading(true)
    try {
      // 1. Delete expenses
      await supabase.from('expenses').delete().eq('user_id', user.id)
      // 2. Delete user row
      await supabase.from('users').delete().eq('id', user.id)
      // 3. Sign out
      await supabase.auth.signOut()
      // 4. Redirect
      router.push('/login')
    } catch (err) {
      setMessage({ type: 'error', text: 'Critical error during deletion' })
    }
    setSaveLoading(false)
  }

  // Styles
  const inputBase = "w-full bg-[var(--bg-card)] border border-[var(--border)] focus:border-[#00ff88] text-[var(--text-primary)] rounded-lg px-4 py-2 outline-none transition-all placeholder:text-[var(--text-muted)]"
  const btnPrimary = "bg-[#00ff88] text-black font-semibold rounded-lg px-6 py-2 hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
  const labelBase = "block text-[11px] font-bold tracking-wider text-[var(--text-muted)] mb-2 uppercase"

  if (authLoading) return <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center"><Loader2 className="animate-spin text-[#00ff88]" size={32} /></div>

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex text-[var(--text-primary)] font-sans selection:bg-[#00ff88] selection:text-black">
      
      {/* Sidebar */}
      <aside className="w-[220px] bg-[var(--bg-primary)] border-r border-[var(--border)] flex flex-col fixed h-full z-40">
        <div className="p-8 pb-4">
          <h1 className="text-xl font-bold tracking-tight">SYMP</h1>
          <div className="h-[2px] w-8 bg-[#00ff88] mt-2"></div>
        </div>
        
        <nav className="flex-1 mt-4 px-3 space-y-1">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'appearance', label: 'Appearance', icon: Palette },
            { id: 'finance', label: 'Finance', icon: DollarSign },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security', icon: Lock },
            { id: 'danger', label: 'Danger Zone', icon: Trash2 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setMessage({ type: '', text: '' }); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${
                activeTab === tab.id 
                  ? 'bg-[var(--bg-card-hover)] text-[#00ff88] border-l-[3px] border-[#00ff88]' 
                  : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)] border-l-[3px] border-transparent'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content Area */}
      <main className="flex-1 ml-[220px] p-10 max-w-4xl relative min-h-screen">
        <header className="mb-10">
          <h2 className="text-3xl font-bold">Settings</h2>
          <p className="text-[var(--text-muted)] mt-1">Manage your account and preferences</p>
        </header>

        <div className="relative">
          <AnimatePresence mode="wait">
            
            {/* SECTION 1: PROFILE */}
            {activeTab === 'profile' && (
              <motion.section 
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6"
              >
                <h3 className="text-[var(--text-primary)] text-lg font-bold mb-6">Profile Settings</h3>
                <div className="space-y-6">
                  <div>
                    <label className={labelBase}>Full Name</label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={inputBase}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className={labelBase}>Email Address</label>
                    <input 
                      type="email" 
                      value={user?.email || ''}
                      disabled
                      className={`${inputBase} bg-[#1a1a1a] opacity-60 cursor-not-allowed`}
                    />
                  </div>
                  <div className="pt-4 flex items-center gap-4">
                    <button 
                      onClick={() => handleSave('Profile', { full_name: fullName })}
                      disabled={saveLoading}
                      className={btnPrimary}
                    >
                      {saveLoading ? <Loader2 className="animate-spin" size={20} /> : 'Save Profile'}
                    </button>
                    {message.type && <span className={`text-sm font-medium ${message.type === 'success' ? 'text-[#00ff88]' : 'text-red-500'}`}>{message.text}</span>}
                  </div>
                </div>
              </motion.section>
            )}

            {/* SECTION 2: APPEARANCE */}
            {activeTab === 'appearance' && (
              <motion.section 
                key="appearance"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6"
              >
                <h3 className="text-lg font-bold mb-6">Appearance</h3>
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Dark Mode</h4>
                      <p className="text-sm text-[var(--text-muted)]">Toggle between light and dark theme</p>
                    </div>
                    <Switch 
                      checked={isDark} 
                      onCheckedChange={toggleTheme} 
                    />
                  </div>

                  <div>
                    <label className={labelBase}>Currency</label>
                    <select 
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className={inputBase + " appearance-none"}
                    >
                      <option value="INR">INR ₹</option>
                      <option value="USD">USD $</option>
                      <option value="EUR">EUR €</option>
                      <option value="GBP">GBP £</option>
                    </select>
                  </div>

                  <div className="pt-4 flex items-center gap-4">
                    <button 
                      onClick={() => handleSave('Appearance', { theme: isDark ? 'dark' : 'light', currency })}
                      disabled={saveLoading}
                      className={btnPrimary}
                    >
                      {saveLoading ? <Loader2 className="animate-spin" size={20} /> : 'Save Appearance'}
                    </button>
                    {message.type && <span className={`text-sm font-medium ${message.type === 'success' ? 'text-[#00ff88]' : 'text-red-500'}`}>{message.text}</span>}
                  </div>
                </div>
              </motion.section>
            )}

            {/* SECTION 3: FINANCE */}
            {activeTab === 'finance' && (
              <motion.section 
                key="finance"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6"
              >
                <h3 className="text-lg font-bold mb-6">Finance</h3>
                <div className="space-y-6">
                  <div>
                    <label className={labelBase}>Monthly Income</label>
                    <input 
                      type="number" 
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(e.target.value)}
                      className={inputBase}
                      placeholder="e.g. 50000"
                    />
                    <p className="text-[11px] text-[var(--text-muted)] mt-2 italic">Total monthly earnings including salary and bonuses.</p>
                  </div>
                  <div>
                    <label className={labelBase}>Savings Goal</label>
                    <input 
                      type="number" 
                      value={savingsGoal}
                      onChange={(e) => setSavingsGoal(e.target.value)}
                      className={inputBase}
                      placeholder="e.g. 15000"
                    />
                    <p className="text-[11px] text-[var(--text-muted)] mt-2 italic">How much you aim to save every month.</p>
                  </div>
                  
                  <div className="pt-4">
                    <div className="flex items-center gap-4 mb-3">
                      <button 
                        onClick={() => handleSave('Finance', { monthly_income: monthlyIncome, savings_goal: savingsGoal })}
                        disabled={saveLoading}
                        className={btnPrimary}
                      >
                        {saveLoading ? <Loader2 className="animate-spin" size={20} /> : 'Save Finance Settings'}
                      </button>
                      {message.type && <span className={`text-sm font-medium ${message.type === 'success' ? 'text-[#00ff88]' : 'text-red-500'}`}>{message.text}</span>}
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">Changes will reflect on your dashboard immediately.</p>
                  </div>
                </div>
              </motion.section>
            )}

            {/* SECTION 4: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <motion.section 
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6"
              >
                <h3 className="text-lg font-bold mb-6">Notifications</h3>
                <div className="space-y-6">
                  {[
                    { id: 'weekly', label: 'Weekly Summary', desc: 'Get a weekly report of your spending', state: weeklyNotif, setState: setWeeklyNotif },
                    { id: 'streak', label: 'Streak Reminders', desc: 'Daily reminder to log your expenses', state: streakNotif, setState: setStreakNotif },
                    { id: 'goals', label: 'Goal Alerts', desc: "Alerts when you're close to hitting a goal", state: goalNotif, setState: setGoalNotif },
                    { id: 'overspend', label: 'Overspending Alerts', desc: 'Warn when avoidable spending exceeds limit', state: overspendNotif, setState: setOverspendNotif },
                  ].map((notif) => (
                    <div key={notif.id} className="flex items-center justify-between pb-4 border-b border-[var(--border)] last:border-0 last:pb-0">
                      <div>
                        <h4 className="font-semibold text-[var(--text-primary)]">{notif.label}</h4>
                        <p className="text-xs text-[var(--text-muted)]">{notif.desc}</p>
                      </div>
                      <Switch 
                        checked={notif.state} 
                        onCheckedChange={notif.setState} 
                      />
                    </div>
                  ))}

                  <div className="pt-6 flex items-center gap-4">
                    <button 
                      onClick={() => handleSave('Notifications', { 
                        notif_weekly: weeklyNotif, 
                        notif_streak: streakNotif, 
                        notif_goals: goalNotif, 
                        notif_overspend: overspendNotif 
                      })}
                      disabled={saveLoading}
                      className={btnPrimary}
                    >
                      {saveLoading ? <Loader2 className="animate-spin" size={20} /> : 'Save Preferences'}
                    </button>
                    {message.type && <span className={`text-sm font-medium ${message.type === 'success' ? 'text-[#00ff88]' : 'text-red-500'}`}>{message.text}</span>}
                  </div>
                </div>
              </motion.section>
            )}

            {/* SECTION 5: SECURITY */}
            {activeTab === 'security' && (
              <motion.section 
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6"
              >
                <h3 className="text-lg font-bold mb-6">Security</h3>
                <div className="space-y-6">
                  <div className="relative">
                    <label className={labelBase}>New Password</label>
                    <div className="relative">
                      <input 
                        type={showNew ? "text" : "password"} 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={inputBase + " pr-12"}
                        placeholder="••••••••"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      >
                        {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {/* Strength Bar */}
                    <div className="mt-3">
                      <div className="h-1 w-full bg-[var(--border)] rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full ${passStrength.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${passStrength.score}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-[10px] text-[var(--text-muted)]">Strength: {passStrength.label}</span>
                        {passStrength.score < 100 && <span className="text-[10px] text-[var(--text-muted)]">Use numbers & special chars</span>}
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <label className={labelBase}>Confirm Password</label>
                    <div className="relative">
                      <input 
                        type={showConfirm ? "text" : "password"} 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={inputBase + " pr-12"}
                        placeholder="••••••••"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      >
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-[10px] text-red-500 mt-2 font-medium">Passwords do not match</p>
                    )}
                  </div>

                  <div className="pt-4 flex items-center gap-4">
                    <button 
                      onClick={handlePasswordUpdate}
                      disabled={saveLoading || !newPassword || newPassword !== confirmPassword}
                      className={btnPrimary}
                    >
                      {saveLoading ? <Loader2 className="animate-spin" size={20} /> : 'Update Password'}
                    </button>
                    {message.type && <span className={`text-sm font-medium ${message.type === 'success' ? 'text-[#00ff88]' : 'text-red-500'}`}>{message.text}</span>}
                  </div>
                </div>
              </motion.section>
            )}

            {/* SECTION 6: DANGER ZONE */}
            {activeTab === 'danger' && (
              <motion.section 
                key="danger"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#1a0a0a] border border-red-500/30 rounded-xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Octagon className="text-red-500" size={24} />
                  <h3 className="text-lg font-bold text-red-500">Delete Account</h3>
                </div>
                
                <p className="text-sm text-[var(--text-muted)] mb-8 leading-relaxed">
                  This will permanently delete all your financial data, expense history, and user profile. 
                  <span className="text-red-400 font-semibold ml-1">This action cannot be undone.</span>
                </p>

                <div className="space-y-6">
                  <div>
                    <label className={labelBase + " text-red-500/70"}>Type "DELETE" to confirm</label>
                    <input 
                      type="text" 
                      value={deleteInput}
                      onChange={(e) => setDeleteInput(e.target.value)}
                      className={inputBase + " border-red-500/20 focus:border-red-500"}
                      placeholder="DELETE"
                    />
                  </div>
                  
                  <div className="pt-2">
                    <button 
                      onClick={() => setShowDeleteModal(true)}
                      disabled={deleteInput !== 'DELETE'}
                      className="w-full bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition-all disabled:opacity-20 disabled:cursor-not-allowed uppercase tracking-widest text-xs"
                    >
                      Permanently Delete Account
                    </button>
                  </div>
                </div>
              </motion.section>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* MODALS */}
      <AlertDialog 
        open={showDeleteModal}
        title="Final Confirmation"
        description="Are you absolutely sure you want to delete your SYMP account? All your financial logs, goals, and investment data will be wiped from our servers forever."
        confirmText="Yes, Delete My Data"
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteModal(false)}
        confirmDisabled={deleteInput !== 'DELETE'}
      />

    </div>
  )
}


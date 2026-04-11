'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { useTheme } from '@/lib/ThemeContext'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Palette, DollarSign, Bell, 
  Lock, Trash2, Check, AlertCircle,
  Moon, Sun, ChevronRight
} from 'lucide-react'

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const { theme, setTheme } = useTheme()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currency, setCurrency] = useState('INR')
  const [notifications, setNotifications] = useState(true)
  const [monthlyGoal, setMonthlyGoal] = useState(0)
  const [income, setIncome] = useState(0)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [activeSection, setActiveSection] = useState('profile')

  // Auth Protection
  useEffect(() => {
    if (!loading && !user) router.push('/login')
  }, [user, loading])

  // Fetch User Data
  const fetchSettings = async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setName(data.name || '')
      setCurrency(data.currency || 'INR')
      setNotifications(data.notifications !== false)
      setMonthlyGoal(data.goal || 0)
      setIncome(data.income || 0)
      setTheme(data.theme || 'dark')
    }
    setEmail(user.email || '')
  }

  useEffect(() => {
    if (user) fetchSettings()
  }, [user])

  // Theme Logic is now gracefully handled globally via ThemeProvider context.

  // Save Functions
  const handleSaveProfile = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        name: name,
        currency: currency,
        notifications: notifications,
        goal: parseFloat(monthlyGoal),
        income: parseFloat(income),
        theme: theme
      }, { onConflict: 'id' })

    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  const handleChangePassword = async () => {
    setPasswordMsg('')
    if (newPassword !== confirmPassword) {
      setPasswordMsg('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      setPasswordMsg('Password must be at least 6 characters')
      return
    }
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    if (error) {
      setPasswordMsg('Error: ' + error.message)
    } else {
      setPasswordMsg('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      alert('Type DELETE to confirm')
      return
    }
    const { error: expErr } = await supabase.from('expenses').delete().eq('user_id', user.id)
    const { error: userErr } = await supabase.from('users').delete().eq('id', user.id)
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Styles
  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fff',
    border: '1px solid #1f2b1f',
    borderRadius: '10px',
    color: theme === 'dark' ? '#fff' : '#000',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '16px',
    transition: 'border-color 0.2s'
  }

  const sectionCardStyle = {
    backgroundColor: theme === 'dark' ? '#111311' : '#fff',
    border: '1px solid #1f2b1f',
    borderRadius: '16px',
    padding: '28px',
    marginBottom: '20px',
    boxShadow: theme === 'light' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
  }

  const saveButtonStyle = {
    padding: '12px 28px',
    background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
    border: 'none',
    borderRadius: '10px',
    color: '#000',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'center'
  }

  const navItemStyle = (id) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    cursor: 'pointer',
    color: activeSection === id ? '#00ff88' : '#6b7280',
    borderRadius: '8px',
    marginBottom: '4px',
    borderLeft: activeSection === id ? '3px solid #00ff88' : '3px solid transparent',
    backgroundColor: activeSection === id ? 'rgba(0,255,136,0.05)' : 'transparent',
    transition: 'all 0.2s',
    fontWeight: activeSection === id ? 'bold' : 'normal',
    fontSize: '14px'
  })

  // Toggle Switch Component
  const Toggle = ({ active, onClick }) => (
    <div 
      onClick={onClick}
      style={{
        width: '40px',
        height: '22px',
        backgroundColor: active ? '#00ff88' : '#1f2b1f',
        borderRadius: '11px',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background-color 0.2s'
      }}
    >
      <div style={{
        width: '18px',
        height: '18px',
        backgroundColor: '#fff',
        borderRadius: '50%',
        position: 'absolute',
        top: '2px',
        left: active ? '20px' : '2px',
        transition: 'left 0.2s'
      }} />
    </div>
  )

  if (loading) return null

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      backgroundColor: theme === 'dark' ? '#0a0a0a' : '#f5f5f5',
      color: theme === 'dark' ? '#fff' : '#111'
    }}>
      {/* Sidebar */}
      <div style={{ 
        width: '240px', 
        padding: '40px 20px', 
        borderRight: `1px solid ${theme === 'dark' ? '#1f2b1f' : '#ddd'}`,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ marginBottom: '32px', paddingLeft: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Settings</h2>
          <p style={{ fontSize: '12px', color: '#6b7280' }}>Manage your account</p>
        </div>

        <nav>
          <div style={navItemStyle('profile')} onClick={() => setActiveSection('profile')}>
            <User size={18} /> Profile
          </div>
          <div style={navItemStyle('appearance')} onClick={() => setActiveSection('appearance')}>
            <Palette size={18} /> Appearance
          </div>
          <div style={navItemStyle('finance')} onClick={() => setActiveSection('finance')}>
            <DollarSign size={18} /> Finance
          </div>
          <div style={navItemStyle('notifications')} onClick={() => setActiveSection('notifications')}>
            <Bell size={18} /> Notifications
          </div>
          <div style={navItemStyle('security')} onClick={() => setActiveSection('security')}>
            <Lock size={18} /> Security
          </div>
          <div style={navItemStyle('danger')} onClick={() => setActiveSection('danger')}>
            <Trash2 size={18} color="#ff4444" /> <span style={{ color: '#ff4444' }}>Danger Zone</span>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '60px 80px', maxWidth: '1000px' }}>
        <AnimatePresence mode="wait">
          
          {/* PROFILE SECTION */}
          {activeSection === 'profile' && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Profile Settings</h2>
              <p style={{ color: '#6b7280', marginBottom: '32px' }}>Personalize your SYMP identity</p>

              <div style={sectionCardStyle}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', letterSpacing: '1px', marginBottom: '8px', fontWeight: 'bold' }}>FULL NAME</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your name"
                    style={inputStyle}
                  />
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', letterSpacing: '1px', marginBottom: '8px', fontWeight: 'bold' }}>EMAIL ADDRESS (LOCKED)</label>
                  <input 
                    type="email" 
                    value={email} 
                    disabled
                    style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button onClick={handleSaveProfile} disabled={saving} style={saveButtonStyle}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  {saved && (
                    <span style={{ color: '#00ff88', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Check size={16} /> ✓ Saved!
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* APPEARANCE SECTION */}
          {activeSection === 'appearance' && (
            <motion.div 
              key="appearance"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Appearance</h2>
              <p style={{ color: '#6b7280', marginBottom: '32px' }}>Customize the look and feel of your dash</p>

              <div style={sectionCardStyle}>
                <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', letterSpacing: '1px', marginBottom: '16px', fontWeight: 'bold' }}>THEME</label>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                  {/* Dark Mode Card */}
                  <div 
                    onClick={() => setTheme('dark')}
                    style={{
                      padding: '20px',
                      borderRadius: '12px',
                      border: theme === 'dark' ? '2px solid #00ff88' : '1px solid #1f2b1f',
                      backgroundColor: theme === 'dark' ? 'rgba(0,255,136,0.05)' : '#0a0a0a',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Moon size={24} color={theme === 'dark' ? '#00ff88' : '#6b7280'} />
                    <h3 style={{ marginTop: '12px', fontWeight: 'bold', fontSize: '15px' }}>Dark Mode</h3>
                    <p style={{ fontSize: '12px', color: '#6b7280' }}>Easy on the eyes</p>
                  </div>

                  {/* Light Mode Card */}
                  <div 
                    onClick={() => setTheme('light')}
                    style={{
                      padding: '20px',
                      borderRadius: '12px',
                      border: theme === 'light' ? '2px solid #00ff88' : '1px solid #ddd',
                      backgroundColor: theme === 'light' ? 'rgba(0,255,136,0.05)' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Sun size={24} color={theme === 'light' ? '#00ff88' : '#6b7280'} />
                    <h3 style={{ marginTop: '12px', fontWeight: 'bold', fontSize: '15px', color: '#111' }}>Light Mode</h3>
                    <p style={{ fontSize: '12px', color: '#6b7280' }}>Clean and bright</p>
                  </div>
                </div>

                <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', letterSpacing: '1px', marginBottom: '16px', fontWeight: 'bold' }}>CURRENCY</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
                  {['INR ₹', 'USD $', 'EUR €', 'GBP £'].map(curr => {
                    const cCode = curr.split(' ')[0]
                    return (
                      <button 
                        key={cCode}
                        onClick={() => setCurrency(cCode)}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '8px',
                          backgroundColor: currency === cCode ? 'rgba(0,255,136,0.1)' : 'transparent',
                          border: currency === cCode ? '1px solid #00ff88' : '1px solid #1f2b1f',
                          color: currency === cCode ? '#00ff88' : '#6b7280',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {curr}
                      </button>
                    )
                  })}
                </div>

                <button onClick={handleSaveProfile} style={saveButtonStyle}>Save Changes</button>
              </div>
            </motion.div>
          )}

          {/* FINANCE SECTION */}
          {activeSection === 'finance' && (
            <motion.div 
              key="finance"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Finance Settings</h2>
              <p style={{ color: '#6b7280', marginBottom: '32px' }}>Calibrate your financial algorithms</p>

              <div style={sectionCardStyle}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', letterSpacing: '1px', marginBottom: '8px', fontWeight: 'bold' }}>MONTHLY INCOME</label>
                  <input 
                    type="number" 
                    value={income} 
                    onChange={e => setIncome(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', letterSpacing: '1px', marginBottom: '8px', fontWeight: 'bold' }}>MONTHLY SAVINGS GOAL</label>
                  <input 
                    type="number" 
                    value={monthlyGoal} 
                    onChange={e => setMonthlyGoal(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div style={{ 
                  padding: '16px', 
                  borderRadius: '12px', 
                  border: '1px solid #00ff8830', 
                  backgroundColor: 'rgba(0,255,136,0.03)',
                  marginBottom: '32px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'start'
                }}>
                  <AlertCircle size={18} color="#00ff88" style={{ marginTop: '2px' }} />
                  <p style={{ fontSize: '12px', color: '#888', lineHeight: '1.6' }}>
                    Your savings velocity and financial metrics are calculated based on your total income minus your logged expenses. Ensure these numbers are accurate for the best advice.
                  </p>
                </div>

                <button onClick={handleSaveProfile} style={saveButtonStyle}>Save Changes</button>
              </div>
            </motion.div>
          )}

          {/* NOTIFICATIONS SECTION */}
          {activeSection === 'notifications' && (
            <motion.div 
              key="notifications"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Notifications</h2>
                  <p style={{ color: '#6b7280' }}>Control how SYMP reaches out to you</p>
                </div>
                <Toggle active={notifications} onClick={() => setNotifications(!notifications)} />
              </div>

              <div style={sectionCardStyle}>
                <div style={{ spaceY: '24px', opacity: notifications ? 1 : 0.4, pointerEvents: notifications ? 'auto' : 'none', transition: 'opacity 0.2s' }}>
                  {[
                    { title: 'Weekly Summary', desc: 'Get a weekly algorithmic spending report' },
                    { title: 'Streak Reminders', desc: "Don't break your goal-setting streak" },
                    { title: 'Goal Alerts', desc: 'Instant feedback when you hit savings milestones' },
                    { title: 'Overspending Alerts', desc: 'When avoidable spending exceeds 20% of income' }
                  ].map((item, i) => (
                    <div key={i} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      paddingBottom: i < 3 ? '20px' : '0',
                      borderBottom: i < 3 ? '1px solid #1f2b1f' : 'none',
                      marginBottom: i < 3 ? '20px' : '32px'
                    }}>
                      <div>
                        <h4 style={{ fontWeight: 'bold', fontSize: '14px' }}>{item.title}</h4>
                        <p style={{ fontSize: '12px', color: '#6b7280' }}>{item.desc}</p>
                      </div>
                      <Toggle active={true} onClick={() => {}} />
                    </div>
                  ))}
                </div>

                <button onClick={handleSaveProfile} style={saveButtonStyle}>Save Changes</button>
              </div>
            </motion.div>
          )}

          {/* SECURITY SECTION */}
          {activeSection === 'security' && (
            <motion.div 
              key="security"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Security</h2>
              <p style={{ color: '#6b7280', marginBottom: '32px' }}>Protect your vault</p>

              <div style={sectionCardStyle}>
                <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', letterSpacing: '1px', marginBottom: '8px', fontWeight: 'bold' }}>NEW PASSWORD</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)}
                  style={inputStyle}
                  placeholder="••••••••"
                />

                <label style={{ display: 'block', fontSize: '11px', color: '#6b7280', letterSpacing: '1px', marginBottom: '8px', fontWeight: 'bold' }}>CONFIRM NEW PASSWORD</label>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={inputStyle}
                  placeholder="••••••••"
                />

                <div style={{ marginBottom: '24px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
                      <span style={{ color: '#6b7280' }}>STRENGTH</span>
                      <span style={{ 
                        color: newPassword.length === 0 ? '#444' : newPassword.length < 6 ? '#ff4444' : newPassword.length < 10 ? '#ffaa00' : '#00ff88',
                        fontWeight: 'bold'
                      }}>
                        {newPassword.length === 0 ? 'NOT ENTERED' : newPassword.length < 6 ? 'WEAK' : newPassword.length < 10 ? 'MEDIUM' : 'STRONG'}
                      </span>
                   </div>
                   <div style={{ display: 'flex', gap: '4px', height: '4px' }}>
                      {[1, 2, 3].map(i => (
                        <div key={i} style={{ 
                          flex: 1, 
                          backgroundColor: newPassword.length === 0 ? '#111' : 
                                         newPassword.length < 6 ? (i <= 1 ? '#ff4444' : '#111') :
                                         newPassword.length < 10 ? (i <= 2 ? '#ffaa00' : '#111') : '#00ff88',
                          borderRadius: '2px'
                        }} />
                      ))}
                   </div>
                </div>

                <button onClick={handleChangePassword} style={saveButtonStyle}>Update Password</button>
                {passwordMsg && (
                   <p style={{ 
                     marginTop: '16px', 
                     fontSize: '12px', 
                     color: passwordMsg.includes('success') ? '#00ff88' : '#ff4444',
                     fontWeight: 'bold'
                   }}>
                     {passwordMsg}
                   </p>
                )}
              </div>
            </motion.div>
          )}

          {/* DANGER ZONE SECTION */}
          {activeSection === 'danger' && (
            <motion.div 
              key="danger"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#ff4444' }}>Danger Zone</h2>
              <p style={{ color: '#6b7280', marginBottom: '32px' }}>Irreversible actions</p>

              <div style={{ ...sectionCardStyle, borderColor: '#ff444450', backgroundColor: 'rgba(255,68,68,0.02)' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff4444', marginBottom: '12px' }}>Delete Account</h3>
                <p style={{ fontSize: '14px', color: '#888', marginBottom: '24px', lineHeight: '1.6' }}>
                  This will permanently delete all your financial data, expense history, and user profile. This action cannot be undone. All database records across all modules will be purged.
                </p>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#ff4444', letterSpacing: '1px', marginBottom: '12px', fontWeight: 'bold' }}>TYPE "DELETE" TO CONFIRM</label>
                  <input 
                    type="text" 
                    value={deleteConfirm} 
                    onChange={e => setDeleteConfirm(e.target.value)}
                    placeholder="DELETE"
                    style={{ ...inputStyle, borderColor: '#ff444430', color: '#ff4444' }}
                  />
                </div>

                <button 
                  onClick={handleDeleteAccount}
                  style={{ 
                    ...saveButtonStyle, 
                    background: 'red', 
                    color: '#fff' 
                  }}
                >
                  Delete My Account Permanently
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}

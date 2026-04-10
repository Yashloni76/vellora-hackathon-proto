import { useState } from 'react'
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import { 
  LayoutDashboard, 
  UserPlus, 
  Brain, 
  TrendingUp, 
  Sliders, 
  Zap, 
  Target, 
  PiggyBank, 
  BookOpen, 
  MessageSquare,
  Settings,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "HOME", icon: LayoutDashboard, path: "/dashboard" },
  { name: "ONBOARDING", icon: UserPlus, path: "/onboarding" },
  { name: "AI ADVISOR", icon: Brain, path: "/ai-advisor" },
  { name: "ANALYTICS", icon: TrendingUp, path: "/analytics" },
  { name: "SIMULATOR", icon: Sliders, path: "/simulator" },
  { name: "STREAK", icon: Zap, path: "/streak" },
  { name: "GOALS", icon: Target, path: "/goals" },
  { name: "INVESTMENTS", icon: PiggyBank, path: "/investments" },
  { name: "JOURNAL", icon: BookOpen, path: "/journal" },
  { name: "FEEDBACK", icon: MessageSquare, path: "/feedback" },
];

export default function Sidebar() {
  const { user } = useAuth()
  const pathname = usePathname();
  const router = useRouter()

  const [quickOpen, setQuickOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('avoidable')
  const [saving, setSaving] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleQuickSave = async () => {
    if (!title.trim() || !amount || !user) return
    setSaving(true)
    await supabase.from('expenses').insert([{
      user_id: user.id,
      title: title.trim(),
      amount: parseFloat(amount),
      type: type,
      mood: 'neutral',
      date: new Date().toISOString().split('T')[0]
    }])
    setTitle('')
    setAmount('')
    setType('avoidable')
    setSaving(false)
    setQuickOpen(false)
  }

  return (
    <aside className="w-[200px] h-screen bg-[#0f0f0f] border-r border-border-dark flex flex-col fixed left-0 top-0 z-50">
      {/* Logo Section */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-center">
        <img src="/logo.png" alt="SYMP's Logo" className="w-[150px] h-[150px] object-contain" />

      </div>

      {/* Navigation Section */}
      <nav className="flex-1 overflow-y-auto no-scrollbar py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.path}
              className={cn(
                "flex items-center gap-3 px-6 py-3 text-[11px] font-bold tracking-wider transition-all duration-200 border-l-[3px]",
                isActive 
                  ? "bg-[#00ff8812] text-[#00ff88] border-[#00ff88]" 
                  : "text-muted border-transparent hover:text-white hover:bg-white/5"
              )}
            >
              <Icon size={16} className={isActive ? "text-[#00ff88]" : "text-muted"} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 mt-auto space-y-4">
        <button
          onClick={() => setQuickOpen(true)}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#00ff88',
            border: 'none',
            borderRadius: '8px',
            color: '#000',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '13px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          + Add Expense
        </button>

        {/* Tier Card */}
        <div className="bg-[#1a1f1a]/40 rounded-xl p-4 border border-border-dark/50">
          <p className="text-[10px] text-muted font-bold mb-2">TIER</p>
          <button className="w-full bg-[#00ff88] text-black text-[11px] font-bold py-2 rounded-lg hover:bg-[#00cc6a] transition-colors glow">
            Upgrade to Pro
          </button>
        </div>

        {/* System Links */}
        <div className="space-y-1">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-2 py-2 text-[11px] font-bold text-muted hover:text-white transition-colors"
          >
            <Settings size={16} />
            SETTINGS
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-2 py-2 text-[11px] font-bold text-red hover:brightness-125 transition-all text-left"
          >
            <LogOut size={16} />
            LOGOUT
          </button>
        </div>
      </div>
    </aside>
    {quickOpen && (
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: '#111311',
          border: '1px solid #00ff88',
          borderRadius: '16px',
          padding: '32px',
          width: '380px',
          maxWidth: '90vw'
        }}>
          <h2 style={{
            color: '#00ff88',
            marginBottom: '6px',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            Quick Add Expense
          </h2>
          <p style={{
            color: '#6b7280',
            fontSize: '13px',
            marginBottom: '24px'
          }}>
            Add from anywhere in the app
          </p>

          <div style={{ marginBottom: '14px' }}>
            <label style={{
              color: '#6b7280',
              fontSize: '11px',
              display: 'block',
              marginBottom: '6px',
              letterSpacing: '1px'
            }}>
              EXPENSE NAME
            </label>
            <input
              type="text"
              placeholder="e.g. Zomato, Netflix"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
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

          <div style={{ marginBottom: '14px' }}>
            <label style={{
              color: '#6b7280',
              fontSize: '11px',
              display: 'block',
              marginBottom: '6px',
              letterSpacing: '1px'
            }}>
              AMOUNT (₹)
            </label>
            <input
              type="number"
              placeholder="e.g. 250"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
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
            <label style={{
              color: '#6b7280',
              fontSize: '11px',
              display: 'block',
              marginBottom: '6px',
              letterSpacing: '1px'
            }}>
              TYPE
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
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

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setQuickOpen(false)}
              style={{
                flex: 1,
                padding: '11px',
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
              onClick={handleQuickSave}
              disabled={saving}
              style={{
                flex: 1,
                padding: '11px',
                backgroundColor: '#00ff88',
                border: 'none',
                borderRadius: '8px',
                color: '#000',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    )}
  );
}

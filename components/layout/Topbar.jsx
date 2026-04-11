"use client";

import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'

export default function Topbar() {
  const { user } = useAuth()
  const [userName, setUserName] = useState('User')
  const [userInitials, setUserInitials] = useState('SY')

  const fetchUserName = async () => {
    if (!user) return

    const { data } = await supabase
      .from('users')
      .select('name')
      .eq('id', user.id)
      .single()

    if (data && data.name) {
      setUserName(data.name.toUpperCase())
      const initials = data.name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
      setUserInitials(initials)
    } else if (user.email) {
      const emailName = user.email.split('@')[0]
      setUserName(emailName.toUpperCase())
      setUserInitials(emailName.slice(0, 2).toUpperCase())
    }
  }

  useEffect(() => {
    if (user) fetchUserName()
  }, [user])

  return (
    <div className="flex items-center gap-6">
      <button className="relative w-10 h-10 rounded-xl bg-gray-900 border border-border-dark flex items-center justify-center hover:bg-gray-800 transition-colors">
        <Bell size={18} className="text-muted" />
        <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red border-2 border-gray-900 shadow-[0_0_8px_rgba(255,68,68,0.5)]" />
      </button>
      
      <div className="flex items-center gap-3 pl-4 border-l border-border-dark/30">
        <div className="text-right">
          <p className="text-[11px] font-bold text-primary tracking-widest uppercase">{userName}</p>
          <p className="text-[9px] font-medium text-green-accent">ARCHITECT TIER</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00ff88]/20 to-transparent border border-border-dark/50 flex items-center justify-center text-green-accent font-bold text-sm">
          {userInitials}
        </div>
      </div>
    </div>
  );
}

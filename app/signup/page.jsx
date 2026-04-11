'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      if (data?.user) {
        const { error: dbError } = await supabase.from('users').insert({
          id: data.user.id,
          email: email,
          name: name,
          income: 0
        })

        if (dbError) {
          setError('Account created but user profile failed. Please contact support.')
          setLoading(false)
          return
        }

        router.push('/onboarding')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-6 text-primary font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[480px] bg-card border border-white/5 rounded-[2.5rem] p-12 shadow-2xl shadow-green-500/5 relative overflow-hidden"
      >
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-accent/10 blur-[80px] -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-accent/5 blur-[80px] -ml-16 -mb-16" />

        <div className="text-center mb-10 relative z-10">
          <motion.h1 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-5xl font-black text-green-accent mb-4 tracking-tighter"
          >
            SYMP
          </motion.h1>
          <h2 className="text-2xl font-bold text-primary tracking-tight">Create Account</h2>
          <p className="text-gray-400 mt-2 text-sm">Start your financial journey</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5 relative z-10">
          <div className="space-y-4">
            {/* Full Name */}
            <div className="relative group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-green-accent transition-colors" />
              <input 
                type="text" 
                placeholder="Full Name"
                required
                className="w-full bg-card border border-white/5 rounded-2xl py-4.5 pl-14 pr-4 outline-none focus:border-green-accent/50 focus:ring-1 focus:ring-[#00ff88]/20 transition-all text-sm font-medium"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Email */}
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-green-accent transition-colors" />
              <input 
                type="email" 
                placeholder="Email address"
                required
                className="w-full bg-card border border-white/5 rounded-2xl py-4.5 pl-14 pr-4 outline-none focus:border-green-accent/50 focus:ring-1 focus:ring-[#00ff88]/20 transition-all text-sm font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-green-accent transition-colors" />
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                className="w-full bg-card border border-white/5 rounded-2xl py-4.5 pl-14 pr-14 outline-none focus:border-green-accent/50 focus:ring-1 focus:ring-[#00ff88]/20 transition-all text-sm font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-green-accent transition-colors" />
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                required
                className="w-full bg-card border border-white/5 rounded-2xl py-4.5 pl-14 pr-4 outline-none focus:border-green-accent/50 focus:ring-1 focus:ring-[#00ff88]/20 transition-all text-sm font-medium"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-green-accent text-primary font-black py-5 rounded-2xl hover:bg-green-accent/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-[0_4px_20px_rgba(0,255,136,0.15)] mt-6"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-xs text-center font-medium"
            >
              {error}
            </motion.div>
          )}

          <p className="text-center text-gray-400 text-sm mt-8">
            Already have an account? {' '}
            <Link href="/login" className="text-green-accent font-bold hover:underline transition-all">
              Sign In
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  )
}

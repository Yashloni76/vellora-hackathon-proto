"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from '@/lib/supabase'
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
  const pathname = usePathname();
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
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
  );
}

'use client'

import { useState } from "react";
import { 
  Home, 
  Zap, 
  Bus, 
  Utensils, 
  Film, 
  Briefcase,
  AlertCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";

const IconMap = {
  home: Home,
  zap: Zap,
  bus: Bus,
  utensils: Utensils,
  film: Film,
  briefcase: Briefcase
};

export default function ExpenseList({ avoidable = [], unavoidable = [], onDelete }) {
  const [confirmId, setConfirmId] = useState(null)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Unavoidable Expenses */}
      <div className="space-y-6">
        <div className="flex justify-between items-end border-b border-border-dark/30 pb-4">
          <h2 className="text-lg font-bold text-white tracking-tight underline decoration-[#00ff88]/30 underline-offset-8">Unavoidable Expenses</h2>
          <span className="text-[10px] text-muted font-bold tracking-[0.2em] uppercase">Fixed Costs</span>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {unavoidable.map((expense) => (
            <ExpenseItem 
              key={expense.id} 
              expense={expense} 
              type="unavoidable" 
              onDelete={onDelete}
              confirmId={confirmId}
              setConfirmId={setConfirmId}
            />
          ))}
          {unavoidable.length === 0 && (
            <p className="text-muted text-xs italic opacity-50">No unavoidable expenses added yet.</p>
          )}
        </div>
      </div>

      {/* Avoidable Expenses */}
      <div className="space-y-6">
        <div className="flex justify-between items-end border-b border-border-dark/30 pb-4">
          <h2 className="text-lg font-bold text-white tracking-tight underline decoration-red/30 underline-offset-8">Avoidable Expenses</h2>
          <span className="text-[10px] text-muted font-bold tracking-[0.2em] uppercase">Lifestyle</span>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {avoidable.map((expense) => (
            <ExpenseItem 
              key={expense.id} 
              expense={expense} 
              type="avoidable" 
              onDelete={onDelete}
              confirmId={confirmId}
              setConfirmId={setConfirmId}
            />
          ))}
          {avoidable.length === 0 && (
            <p className="text-muted text-xs italic opacity-50">No avoidable expenses added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ExpenseItem({ expense, type, onDelete, confirmId, setConfirmId }) {
  const Icon = IconMap[expense.icon] || AlertCircle;

  // Custom labels as requested
  const getSubLabel = () => {
    if (expense.title === "Monthly Rent") return "AUTO-PAY";
    if (expense.title === "Utility Bills") return "PENDING";
    if (expense.title === "Transport Pass") return "SUBSCRIPTION";
    return expense.sub || expense.tag;
  };

  const isConfirming = confirmId === expense.id;

  return (
    <div className="group bg-[#111311] border border-border-dark rounded-xl p-4 flex items-center justify-between hover:bg-[#1a1f1a] transition-all hover:scale-[1.01]">
      <div className="flex items-center gap-4">
        {/* Icon Container */}
        <div className="w-10 h-10 rounded-lg bg-gray-900 border border-border-dark/50 flex items-center justify-center group-hover:bg-[#00ff8810] transition-colors">
          <Icon size={18} className="text-muted group-hover:text-[#00ff88] transition-colors" />
        </div>

        {/* Info */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-[13px] font-bold text-white tracking-tight">{expense.title}</h3>
            {/* Tag Pills */}
            {(expense.tag || expense.mood) && (
              <span className={cn(
                "px-2 py-0.5 rounded text-[8px] font-bold tracking-wider leading-none",
                type === "unavoidable" ? {
                  "bg-[#00ff8815] text-[#00ff88]": expense.tag === "ESSENTIAL",
                  "bg-blue-500/15 text-blue-400": expense.tag === "UTILITY",
                  "bg-yellow-500/15 text-yellow-500": expense.tag === "LOGISTICS"
                } : {
                  "bg-[#ff4444] text-white": expense.mood === "REGRET",
                  "bg-[#00ff88] text-black": expense.mood === "HAPPY",
                  "bg-[#374151] text-white": expense.mood === "NEUTRAL"
                }
              )}>
                {type === "unavoidable" ? expense.tag : expense.mood}
              </span>
            )}
          </div>
          <p className="text-[10px] text-muted font-medium uppercase tracking-widest">{getSubLabel()}</p>
        </div>
      </div>

      {/* Amount & Emotion & Delete Action */}
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-bold text-white">₹{expense.amount.toLocaleString("en-IN")}</p>
          <p className="text-[9px] text-muted font-medium">SETTLED</p>
        </div>
        {type === "avoidable" && (
          <div className="flex flex-col items-center gap-1.5">
             <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-yellow-500 to-orange-400 shadow-[0_0_8px_rgba(244,114,22,0.4)] border-2 border-[#111311]" />
             <span className="text-[7px] text-muted font-bold tracking-tighter uppercase leading-none">Emotion</span>
          </div>
        )}
        
        {/* Delete Handle System */}
        <div className="ml-2 flex flex-col items-end min-w-[70px] justify-center">
          {isConfirming ? (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmId(null); }}
                className="text-[#6b7280] text-xs border border-[#1f2b1f] rounded px-2 py-0.5 hover:bg-[#1a1f1a]"
              >
                ✕ Cancel
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(expense.id); }}
                className="text-[#ff4444] text-xs border border-[#ff4444] rounded px-2 py-0.5 hover:bg-[#ff4444] hover:text-white"
              >
                Delete
              </button>
            </div>
          ) : (
            <button
               onClick={(e) => { e.stopPropagation(); setConfirmId(expense.id); }}
               className="ml-auto p-1 rounded hover:bg-[#1a1f1a] transition-colors opacity-0 group-hover:opacity-100"
               title="Delete expense"
             >
               <svg
                 xmlns="http://www.w3.org/2000/svg"
                 width="14"
                 height="14"
                 viewBox="0 0 24 24"
                 fill="none"
                 stroke="currentColor"
                 strokeWidth="2"
                 strokeLinecap="round"
                 strokeLinejoin="round"
                 className="text-[#6b7280] hover:text-[#ff4444] transition-colors"
               >
                 <polyline points="3 6 5 6 21 6" />
                 <path d="M19 6l-1 14H6L5 6" />
                 <path d="M10 11v6" />
                 <path d="M14 11v6" />
                 <path d="M9 6V4h6v2" />
               </svg>
             </button>
          )}
        </div>
      </div>
    </div>
  );
}

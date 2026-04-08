import { 
  Home, 
  Zap, 
  Bus, 
  Utensils, 
  Film, 
  Briefcase,
  AlertCircle 
} from "lucide-react";
import { unavoidableExpenses, avoidableExpenses } from "@/data/dummy";
import { cn } from "@/lib/utils";

const IconMap = {
  home: Home,
  zap: Zap,
  bus: Bus,
  utensils: Utensils,
  film: Film,
  briefcase: Briefcase
};

export default function ExpenseList({ realExpenses }) {
  const avoidable = realExpenses?.avoidable?.length > 0 ? realExpenses.avoidable : avoidableExpenses
  const unavoidable = realExpenses?.unavoidable?.length > 0 ? realExpenses.unavoidable : unavoidableExpenses
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
            <ExpenseItem key={expense.id} expense={expense} type="unavoidable" />
          ))}
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
            <ExpenseItem key={expense.id} expense={expense} type="avoidable" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ExpenseItem({ expense, type }) {
  const Icon = IconMap[expense.icon] || AlertCircle;

  // Custom labels as requested
  const getSubLabel = () => {
    if (expense.title === "Monthly Rent") return "AUTO-PAY";
    if (expense.title === "Utility Bills") return "PENDING";
    if (expense.title === "Transport Pass") return "SUBSCRIPTION";
    return expense.sub || expense.tag;
  };

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

      {/* Amount & Emotion */}
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
      </div>
    </div>
  );
}
